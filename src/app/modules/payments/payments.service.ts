import { messages } from './../notification/notification.constant';
import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Payments from './payments.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import Contents from '../contents/contents.models';
import { IContents } from '../contents/contents.interface';
import { User } from '../user/user.models';
import StripeService from '../../class/stripe/stripe';
import config from '../../config';
import { startSession } from 'mongoose';
import { Response } from 'express';
import moment from 'moment';
import { PAYMENT_STATUS } from './payments.constants';
import { USER_ROLE } from '../user/user.constants';
import { notificationServices } from '../notification/notification.service';
import { modeType } from '../notification/notification.interface';

const checkout = async (payload: any) => {
  const content: IContents | null = await Contents.findOne({}).select(
    'perTokenPrice',
  );
  payload['tokenRate'] = Number(content?.perTokenPrice);
  payload['price'] = Number(content?.perTokenPrice) * payload.totalToken;
  const payment: IPayments | null = await Payments.create(payload);

  if (!payment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment creation failed!');
  }

  const product = {
    amount: payment.tokenRate,
    //@ts-ignore

    name: `Banana  Purchase`,
    quantity: payment.totalToken,
  };

  let customerId = '';
  const user = await User.IsUserExistId(payment?.user?.toString());
  if (user?.customerId) {
    customerId = user?.customerId;
  } else {
    const customer = await StripeService.createCustomer(
      user?.email,
      user?.name,
    );
    await User.findByIdAndUpdate(
      user?._id,
      { customerId: customer?.id },
      { upsert: false },
    );
    customerId = customer?.id;
  }

  const success_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment?._id}`;

  const cancel_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment?._id}`;
  console.log({ success_url, cancel_url });
  const checkoutSession = await StripeService.getCheckoutSession(
    product,
    success_url,
    cancel_url,
    customerId,
  );

  return checkoutSession?.url;
};

const confirmPayment = async (query: Record<string, any>, res: Response) => {
  const { sessionId, paymentId, device } = query;
  const session = await startSession();
  const PaymentSession = await StripeService.getPaymentSession(sessionId);

  const paymentIntentId = PaymentSession.payment_intent as string;
  const paymentIntent =
    await StripeService.getStripe().paymentIntents.retrieve(paymentIntentId);
  // Retrieve the PaymentIntent

  if (!(await StripeService.isPaymentSuccess(sessionId))) {
    throw res.render('paymentError', {
      message: 'Payment session is not completed',
      device: device || '',
    });
  }

  try {
    session.startTransaction();

    const charge = await StripeService.getStripe().charges.retrieve(
      paymentIntent.latest_charge as string,
    );
    if (charge?.refunded) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment has been refunded');
    }
    const paymentDate = moment.unix(charge.created).format('YYYY-MM-DD HH:mm'); // Adjusted format

    // Create the output object
    const chargeDetails = {
      amount: charge?.amount,
      currency: charge?.currency,
      status: charge?.status,
      paymentMethod: charge?.payment_method,
      paymentMethodDetails: charge?.payment_method_details?.card,
      transactionId: charge?.balance_transaction,
      cardLast4: charge?.payment_method_details?.card?.last4,
      paymentDate: paymentDate,
      receipt_url: charge?.receipt_url,
    };

    const payment = await Payments.findByIdAndUpdate(
      paymentId,
      {
        status: PAYMENT_STATUS?.paid,
        paymentIntentId: paymentIntentId,
        tnxId: charge?.balance_transaction,
        paymentDate: chargeDetails?.paymentDate,
        cardLast4: chargeDetails?.cardLast4,
        paymentMethod: chargeDetails?.paymentMethod,
        receipt_url: chargeDetails?.receipt_url,
      },
      { new: true, session },
    ).populate([
      { path: 'user', select: 'name _id email phoneNumber profile ' },
    ]);

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment Not Found!');
    }

    const admin = await User.findOne({ role: USER_ROLE.admin });
    if (admin) {
      await notificationServices.insertNotificationIntoDb({
        receiver: admin?._id,
        message: 'New Banana Token Purchase',
        description: `A user has successfully purchased ${payment?.totalToken} Banana Token. Payment transition id: ${payment?.tnxId}`,
        refference: payment?._id,
        model_type: modeType.Payments,
      });
    }

    if (payment?.user) {
      await notificationServices.insertNotificationIntoDb({
        receiver: payment?.user,
        message: 'Banana Token Purchase Successful',
        description: `You have successfully purchased ${payment?.totalToken} Banana Token. Transaction ID: ${payment?.tnxId}`,
        refference: payment?._id,
        model_type: modeType.Payments,
      });
    }

    await session.commitTransaction();
    return { ...payment.toObject(), chargeDetails };
  } catch (error: any) {
    await session.abortTransaction();

    if (paymentIntentId) {
      try {
        await StripeService.refund(paymentId);
      } catch (refundError: any) {
        console.error('Error processing refund:', refundError.message);
        throw res.render('paymentError', {
          message:
            error.message ||
            `Error processing refund: ${refundError?.messages}`,
          device: device || '',
        });
      }
    }
    throw res.render('paymentError', {
      message: error.message || 'Server internal error',
      device: device || '',
    });
  } finally {
    session.endSession();
  }
};

export const paymentsService = {
  checkout,
  confirmPayment,
};
