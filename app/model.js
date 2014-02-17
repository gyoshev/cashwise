var cashwise = (function() {
    var localDataSource = new kendo.data.DataSource({
        data: [
            { name: "Candy!", price: 1.95 },
            { name: "Wine", price: 11.95 },
            { name: "Lunch", price: 10.35 },
            { name: "Lunch", price: 10.95 },
            { name: "Candy!", price: 1.95 },
            { name: "Wine", price: 11.95 },
            { name: "Candy!", price: 1.95 },
            { name: "Wine", price: 11 },
            { name: "Lunch", price: 10.95 }
        ]
    });

    return {
        initHistory: function() {
            var listView = this.content.find("[data-role=listview]").data("kendoMobileListView");

            listView.setDataSource(localDataSource);
        },
        closeModal: function() {
            $("[data-role=modalview]").kendoMobileModalView("close");
        },
        categories: [
            "Groceries", "Eating out", "Travel", "Cat stuff", "Clothing",
            "Cabs", "Cosmetics", "Games", "Household", "C2H5OH",
            "Clothing", "Bills", "Car", "Health", "Other"
        ],
        currentPurchase: kendo.observable({
            name: "foo",
            price: 123,
            category: ""
        }),
        setCategory: function(e) {
            cashwise.currentPurchase.set("category", e.button.text());
            kendo.bind($("#purchase-form"), cashwise.currentPurchase);
        },
        logCurrentPurchase: function(e) {
            var purchase = cashwise.currentPurchase;
            localDataSource.add($.extend({}, purchase));

            purchase.set("name", "");
            purchase.set("price", 0);

            cashwise.closeModal();
        }
    };
})();
