const Profile  = require('../../../models/profile');
const Product  = require('../../../models/product');
const Order  = require('../../../models/order');
const Subscription  = require('../../../models/subscription');
const Payment  = require('../../../models/payment');
const Device  = require('../../../models/device');

const dbMap = require('../../../utilities/db-map');
const HttpUtil = require('../../../utilities/http-util');

module.exports = class OrderService {

    constructor() {}

    async getAllOrders() {
        let orders = (await Order.find({})).map(x => dbMap(x));
        let profiles = (await Profile.find({})).map(x => dbMap(x));
        let products = (await Product.find({})).map(x => dbMap(x));

        for (let i in orders) {
            let order = orders[i];

            order.products = products.filter(x => {
                return order.productIds.filter(y => y == x.id).length > 0
            });
            order.profile = profiles.filter(x => x.accountId == order.accountId)[0];
        }

        return orders;
    }

    async getAccountOrders(accountId) {
        let orders = await Order.findByAccountId(accountId);
        return orders.map(x => dbMap(x));
    }

    async getOrder(orderId, accountId, isAdmin) {
        let order = await Order.findById(orderId);

        if (order.accountId != accountId && !isAdmin) {
            HttpUtil.throw400Error('This is not your order');
        }

        return dbMap(order);
    }

    async createOrder(accountId, orderInput) {
        let order = new Order(orderInput);
        order.accountId = accountId;
        order.deliveryStatus = 'pending';
        order.paymentStatus = 'pending';
        await order.save();
        
        // TODO: send an email at this point.

        return  dbMap(order);
    }

    async updateOrder(orderId, orderInput) {
        let order = await Order.findById(orderId);
        
        order.paymentStatus = orderInput.paymentStatus;
        order.deliveryStatus = orderInput.deliveryStatus;
        await order.save();
        
        // TODO: send an email at this point.

        return  dbMap(order);
    }


    async handlePayfastPayment(payfastPayment) {

        let order = await Order.findById(payfastPayment.m_payment_id);
        if (!order) {
            HttpUtil.throw400Error('Invalid Request');
        }

        if (order.paymentStatus == 'complete') {
            return await this.handleSubscriptionPayment(payfastPayment, order);
        } else {
            return await this.handleOrderPayment(payfastPayment, order);
        }
    }

    async handleSubscriptionPayment(payfastPayment, order) {

        let subscriptions = await Subscription.findByOrderId(order.id);

        if (payfastPayment.payment_status == 'COMPLETE') {
            let payment = new Payment({
                subscriptionIds: subscriptions.map(x => x.id),
                accountId: order.accountId,
                payfastId: payfastPayment.pf_payment_id,
                amount: payfastPayment.amount_gross,
                payfastJson: JSON.stringify(payfastPayment)
            });
            await payment.save();
            
            // TODO: send invoice email at this point
        }
        else if (payfastPayment.payment_status == 'CANCELLED') {

            for (let i = 0; i < subscriptions.length; i++) {
                subscriptions[i].status = 'cancelled';
                await subscriptions[i].save();
            }
            
            // TODO: send a payment failed email here.. ALSO maybe think about how we can leave this active for a week or so (give the user a chance to pay)
        }
        
        return dbMap(order);
    }

    async handleOrderPayment(payfastPayment, order) {
        if (payfastPayment.payment_status == 'COMPLETE') {
            order.paymentStatus = 'complete';
            await order.save();

            let payment = new Payment({
                orderId: order.id,
                accountId: order.accountId,
                payfastId: payfastPayment.pf_payment_id,
                amount: payfastPayment.amount_gross,
                payfastJson: JSON.stringify(payfastPayment)
            });
            await payment.save();

            // TODO: send invoice email at this point

            await this.createOrderSubsAndDevices(order);

        } else if (payfastPayment.payment_status == 'CANCELLED') {
            order.paymentStatus = 'cancelled';
            await order.save();

            // TODO: send a payment failed email here..
        }
        
        return dbMap(order);
    }

    async createOrderSubsAndDevices(order) {

        for (let i = 0; i < order.productIds.length; i++) {
            let productId = order.productIds[i];

            let subscription = new Subscription({
                productId: productId,
                accountId: order.accountId,
                orderId: order.id,
                status: 'active',
            });
            await subscription.save();

            let device = new Device({
                accountId: order.accountId,
                productId: productId,
                subscriptionId: subscription.id,
            });
            await device.save();
        }
    }
};