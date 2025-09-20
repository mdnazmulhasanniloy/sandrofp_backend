"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const payments_models_1 = __importDefault(require("./payments.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const contents_models_1 = __importDefault(require("../contents/contents.models"));
const user_models_1 = require("../user/user.models");
const stripe_1 = __importDefault(require("../../class/stripe/stripe"));
const config_1 = __importDefault(require("../../config"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const payments_constants_1 = require("./payments.constants");
const user_constants_1 = require("../user/user.constants");
const notification_service_1 = require("../notification/notification.service");
const notification_interface_1 = require("../notification/notification.interface");
const checkout = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const content = yield contents_models_1.default.findOne({}).select('perTokenPrice');
    payload['tokenRate'] = Number(content === null || content === void 0 ? void 0 : content.perTokenPrice);
    payload['price'] = Number(content === null || content === void 0 ? void 0 : content.perTokenPrice) * payload.totalToken;
    const payment = yield payments_models_1.default.create(payload);
    if (!payment) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment creation failed!');
    }
    const product = {
        amount: payment.tokenRate,
        //@ts-ignore
        name: `Banana  Purchase`,
        quantity: payment.totalToken,
    };
    let customerId = '';
    const user = yield user_models_1.User.IsUserExistId((_a = payment === null || payment === void 0 ? void 0 : payment.user) === null || _a === void 0 ? void 0 : _a.toString());
    if (user === null || user === void 0 ? void 0 : user.customerId) {
        customerId = user === null || user === void 0 ? void 0 : user.customerId;
    }
    else {
        const customer = yield stripe_1.default.createCustomer(user === null || user === void 0 ? void 0 : user.email, user === null || user === void 0 ? void 0 : user.name);
        yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, { customerId: customer === null || customer === void 0 ? void 0 : customer.id }, { upsert: false });
        customerId = customer === null || customer === void 0 ? void 0 : customer.id;
    }
    const success_url = `${config_1.default.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment === null || payment === void 0 ? void 0 : payment._id}`;
    const cancel_url = `${config_1.default.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payment === null || payment === void 0 ? void 0 : payment._id}`;
    console.log({ success_url, cancel_url });
    const checkoutSession = yield stripe_1.default.getCheckoutSession(product, success_url, cancel_url, customerId);
    return checkoutSession === null || checkoutSession === void 0 ? void 0 : checkoutSession.url;
});
const confirmPayment = (query, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { sessionId, paymentId, device } = query;
    const session = yield (0, mongoose_1.startSession)();
    const PaymentSession = yield stripe_1.default.getPaymentSession(sessionId);
    const paymentIntentId = PaymentSession.payment_intent;
    const paymentIntent = yield stripe_1.default.getStripe().paymentIntents.retrieve(paymentIntentId);
    // Retrieve the PaymentIntent
    if (!(yield stripe_1.default.isPaymentSuccess(sessionId))) {
        throw res.render('paymentError', {
            message: 'Payment session is not completed',
            device: device || '',
        });
    }
    const payment = yield payments_models_1.default.findById(paymentId);
    if ((payment === null || payment === void 0 ? void 0 : payment.status) === payments_constants_1.PAYMENT_STATUS.paid) {
        throw res.render('paymentError', {
            message: 'This payment is already confirmed.',
            device: device || '',
        });
    }
    try {
        session.startTransaction();
        const charge = yield stripe_1.default.getStripe().charges.retrieve(paymentIntent.latest_charge);
        if (charge === null || charge === void 0 ? void 0 : charge.refunded) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment has been refunded');
        }
        const paymentDate = moment_1.default.unix(charge.created).format('YYYY-MM-DD HH:mm'); // Adjusted format
        // Create the output object
        const chargeDetails = {
            amount: charge === null || charge === void 0 ? void 0 : charge.amount,
            currency: charge === null || charge === void 0 ? void 0 : charge.currency,
            status: charge === null || charge === void 0 ? void 0 : charge.status,
            paymentMethod: charge === null || charge === void 0 ? void 0 : charge.payment_method,
            paymentMethodDetails: (_a = charge === null || charge === void 0 ? void 0 : charge.payment_method_details) === null || _a === void 0 ? void 0 : _a.card,
            transactionId: charge === null || charge === void 0 ? void 0 : charge.balance_transaction,
            cardLast4: (_c = (_b = charge === null || charge === void 0 ? void 0 : charge.payment_method_details) === null || _b === void 0 ? void 0 : _b.card) === null || _c === void 0 ? void 0 : _c.last4,
            paymentDate: paymentDate,
            receipt_url: charge === null || charge === void 0 ? void 0 : charge.receipt_url,
        };
        const payment = yield payments_models_1.default.findByIdAndUpdate(paymentId, {
            status: payments_constants_1.PAYMENT_STATUS === null || payments_constants_1.PAYMENT_STATUS === void 0 ? void 0 : payments_constants_1.PAYMENT_STATUS.paid,
            paymentIntentId: paymentIntentId,
            tnxId: charge === null || charge === void 0 ? void 0 : charge.balance_transaction,
            paymentDate: chargeDetails === null || chargeDetails === void 0 ? void 0 : chargeDetails.paymentDate,
            cardLast4: chargeDetails === null || chargeDetails === void 0 ? void 0 : chargeDetails.cardLast4,
            paymentMethod: chargeDetails === null || chargeDetails === void 0 ? void 0 : chargeDetails.paymentMethod,
            receipt_url: chargeDetails === null || chargeDetails === void 0 ? void 0 : chargeDetails.receipt_url,
        }, { new: true, session }).populate([
            { path: 'user', select: 'name _id email phoneNumber profile ' },
        ]);
        if (!payment) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment Not Found!');
        }
        const admin = yield user_models_1.User.findOne({ role: user_constants_1.USER_ROLE.admin });
        if (admin) {
            yield notification_service_1.notificationServices.insertNotificationIntoDb({
                receiver: admin === null || admin === void 0 ? void 0 : admin._id,
                message: 'New Banana Token Purchase',
                description: `A user has successfully purchased ${payment === null || payment === void 0 ? void 0 : payment.totalToken} Banana Token. Payment transition id: ${payment === null || payment === void 0 ? void 0 : payment.tnxId}`,
                refference: payment === null || payment === void 0 ? void 0 : payment._id,
                model_type: notification_interface_1.modeType.Payments,
            });
        }
        // if (payment?.user) {
        yield notification_service_1.notificationServices.insertNotificationIntoDb({
            receiver: payment === null || payment === void 0 ? void 0 : payment.user,
            message: 'Banana Token Purchase Successful',
            description: `You have successfully purchased ${payment === null || payment === void 0 ? void 0 : payment.totalToken} Banana Token. Transaction ID: ${payment === null || payment === void 0 ? void 0 : payment.tnxId}`,
            refference: payment === null || payment === void 0 ? void 0 : payment._id,
            model_type: notification_interface_1.modeType.Payments,
        });
        // }
        yield session.commitTransaction();
        return Object.assign(Object.assign({}, payment.toObject()), { chargeDetails });
    }
    catch (error) {
        yield session.abortTransaction();
        if (paymentIntentId) {
            try {
                yield stripe_1.default.refund(paymentId);
            }
            catch (refundError) {
                console.error('Error processing refund:', refundError.message);
                throw res.render('paymentError', {
                    message: error.message ||
                        `Error processing refund: ${refundError === null || refundError === void 0 ? void 0 : refundError.messages}`,
                    device: device || '',
                });
            }
        }
        throw res.render('paymentError', {
            message: error.message || 'Server internal error',
            device: device || '',
        });
    }
    finally {
        session.endSession();
    }
});
exports.paymentsService = {
    checkout,
    confirmPayment,
};
