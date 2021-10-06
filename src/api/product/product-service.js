const Product = require('../../models/product');
const dbMap = require('../../utilities/db-map');

module.exports = class ProductService {

    constructor() { }

    async getProducts() {
        let products = await Product.find({});
        return products.map(x => dbMap(x));
    }

    async getProduct(productId) {
        let product = await Product.findById(productId);
        return dbMap(product);
    }

    
    async createProduct(productInput) {
        let product = new Product(productInput);
        await product.save();
        return dbMap(product);
    }

    async updateProduct(productInput) {
        let product = await Product.findById(productInput.id);

        product.name = productInput.name;
        product.mode = productInput.mode;
        product.price = productInput.price;
        product.monthlyPrice = productInput.monthlyPrice;
        product.yearlyPrice = productInput.yearlyPrice;
        await product.save();

        return dbMap(product);
    }

    async updateProductImage(productId, imageUrl) {
        let product = await Product.findById(productId);

        product.imagePath = imageUrl + '?' + new Date().getTime();
        await product.save();

        return dbMap(product);
    }
};