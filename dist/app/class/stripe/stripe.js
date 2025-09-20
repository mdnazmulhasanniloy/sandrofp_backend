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
const stripe_1 = require("stripe");
const config_1 = __importDefault(require("../../config"));
class StripeServices {
    stripe() {
        var _a;
        return new stripe_1.Stripe((_a = config_1.default.stripe) === null || _a === void 0 ? void 0 : _a.stripe_api_secret, {
            apiVersion: '2024-06-20',
            typescript: true,
        });
    }
    handleError(error, message) {
        if (error instanceof stripe_1.Stripe.errors.StripeError) {
            console.error('Stripe Error:', error.message);
            throw new Error(`Stripe Error: ${message} - ${error.message}`);
        }
        else if (error instanceof Error) {
            console.error('Error:', error.message);
            throw new Error(`${message} - ${error.message}`);
        }
        else {
            // Unknown error types
            console.error('Unknown Error:', error);
            throw new Error(`${message} - An unknown error occurred.`);
        }
    }
    connectAccount(returnUrl, refreshUrl, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ returnUrl, refreshUrl, accountId });
            try {
                const accountLink = yield this.stripe().accountLinks.create({
                    account: accountId,
                    return_url: returnUrl,
                    refresh_url: refreshUrl,
                    type: 'account_onboarding',
                });
                return accountLink;
            }
            catch (error) {
                this.handleError(error, 'Error connecting account');
            }
        });
    }
    createPaymentIntent(amount_1, currency_1) {
        return __awaiter(this, arguments, void 0, function* (amount, currency, payment_method_types = ['card']) {
            try {
                return yield this.stripe().paymentIntents.create({
                    amount: parseFloat((amount * 100).toFixed(2)), // Convert amount to cents
                    currency,
                    payment_method_types,
                });
            }
            catch (error) {
                this.handleError(error, 'Error creating payment intent');
            }
        });
    }
    transfer(amount_1, accountId_1) {
        return __awaiter(this, arguments, void 0, function* (amount, accountId, currency = 'usd') {
            try {
                const balance = yield this.stripe().balance.retrieve();
                const availableBalance = balance.available.reduce((total, bal) => total + bal.amount, 0);
                if (availableBalance < amount) {
                    console.log('Insufficient funds to cover the transfer.');
                    throw new Error('Insufficient funds to cover the transfer.');
                }
                return yield this.stripe().transfers.create({
                    amount,
                    currency,
                    destination: accountId,
                });
            }
            catch (error) {
                this.handleError(error, 'Error transferring funds');
            }
        });
    }
    refund(payment_intent, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (amount) {
                    return yield this.stripe().refunds.create({
                        payment_intent: payment_intent,
                        amount: Math.round(amount),
                    });
                }
                return yield this.stripe().refunds.create({
                    payment_intent: payment_intent,
                });
            }
            catch (error) {
                this.handleError(error, 'Error processing refund');
            }
        });
    }
    retrieve(session_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // return await this.stripe().paymentIntents.retrieve(intents_id);
                return yield this.stripe().checkout.sessions.retrieve(session_id);
            }
            catch (error) {
                this.handleError(error, 'Error retrieving session');
            }
        });
    }
    getPaymentSession(session_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.stripe().checkout.sessions.retrieve(session_id);
                // return (await this.stripe().paymentIntents.retrieve(intents_id)).status;
            }
            catch (error) {
                this.handleError(error, 'Error retrieving payment status');
            }
        });
    }
    isPaymentSuccess(session_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = (yield this.stripe().checkout.sessions.retrieve(session_id)).status;
                return status === 'complete';
            }
            catch (error) {
                this.handleError(error, 'Error checking payment success');
            }
        });
    }
    getCheckoutSession(product_1, success_url_1, cancel_url_1) {
        return __awaiter(this, arguments, void 0, function* (product, success_url, cancel_url, customer = '', // Optional: customer ID for Stripe
        currency = 'usd', payment_method_types = ['card']) {
            try {
                if (!(product === null || product === void 0 ? void 0 : product.name) || !(product === null || product === void 0 ? void 0 : product.amount) || !(product === null || product === void 0 ? void 0 : product.quantity)) {
                    throw new Error('Product details are incomplete.');
                }
                const stripe = this.stripe();
                return yield stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price_data: {
                                currency,
                                product_data: {
                                    name: product === null || product === void 0 ? void 0 : product.name,
                                },
                                unit_amount: (product === null || product === void 0 ? void 0 : product.amount) * 100,
                            },
                            quantity: product === null || product === void 0 ? void 0 : product.quantity,
                        },
                    ],
                    success_url: success_url,
                    cancel_url: cancel_url,
                    mode: 'payment',
                    // metadata: {
                    //   user: JSON.stringify({
                    //     paymentId: payment.id,
                    //   }),
                    // },
                    invoice_creation: {
                        enabled: true,
                    },
                    customer,
                    // payment_intent_data: {
                    //   metadata: {
                    //     payment: JSON.stringify({
                    //       ...payment,
                    //     }),
                    //   },
                    // },
                    // payment_method_types: ['card', 'amazon_pay', 'cashapp', 'us_bank_account'],
                    payment_method_types,
                });
            }
            catch (error) {
                this.handleError(error, 'Error creating checkout session');
            }
        });
    }
    getExchangeRateQuote(sourceCurrency, targetCurrency, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield fetch(`https://api.exchangerate.host/convert?access_key=${config_1.default.stripe.stripe_api_key}&from=${sourceCurrency}&to=${targetCurrency}&amount=${amount}`);
                const data = yield res.json();
                return Math.round(data.result * 100);
            }
            catch (error) {
                this.handleError(error, 'Error creating checkout session');
            }
        });
    }
    createCustomer(email, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.stripe().customers.create({
                    email,
                    name,
                    //   description: 'HandyHub.pro Customer', // Optional: for dashboard reference
                    //   metadata: {
                    //     platform: 'HandyHub.pro', // Custom metadata for tracking
                    //   },
                });
            }
            catch (error) {
                this.handleError(error, 'customer creation failed');
            }
        });
    }
    getStripe() {
        return this.stripe();
    }
}
const StripeService = new StripeServices();
exports.default = StripeService;
