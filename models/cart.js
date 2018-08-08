module.exports = function Cart(oldCart){
    // tanda || maksudnya jika yg di parse itu kosong maka akan ngambil 0 atau empty object
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    // ini untuk ketika user klik tombol beli
    this.add = function(item, id){
        var storedItem = this.items[id];
        // jika stored item belum ada maka bikin stored item object
        if(!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    this.addQty = function(id){
        this.items[id].qty++;
        this.items[id].price += this.items[id].item.price; 
        this.totalQty++;
        this.totalPrice += this.items[id].item.price;
    };

    this.reduceByOne = function(id){
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price; 
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <=0){
            delete this.items[id];
        }
    };
    
    this.getQty = function(id){
        return this.items[id].qty;
    };

    this.removeItem = function(id){
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    this.addTotal = function(ongkir){
        this.totalPrice = parseInt(this.totalPrice) + parseInt(ongkir);
    }

    this.getTotal = function(){
        return this.totalPrice;
    }

    this.generateArray = function(){
        var arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
};