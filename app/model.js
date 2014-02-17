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

    localDataSource.read();

    function touchstart(e) {
        var target = $(e.touch.initialTouch),
            listview = $("[data-role=listview]").data("kendoMobileListView"),
            model,
            button = $(e.touch.target).find("[data-role=button]:visible");

        if (target.closest("[data-role=button]")[0]) {
            model = localDataSource.getByUid($(e.touch.target).attr("data-uid"));
            localDataSource.remove(model);

            this.events.cancel();
            e.event.stopPropagation();
        } else if (button[0]) {
            button.hide();

            this.events.cancel();
        } else {
            $(".delete[data-role=button]:visible").hide();
        }
    }

    var swipe = function(e) {
        var button = kendo.fx($(e.touch.currentTarget).find("[data-role=button]"));
        button.expand().duration(200).play();
    };

    return {
        initHistory: function(e) {
            var content = this.content;

            var listView = content.find("[data-role=listview]").data("kendoMobileListView");

            listView.setDataSource(localDataSource);

            listView.element.kendoTouch({
                filter: ">li",
                enableSwipe: true,
                touchstart: touchstart,
                swipe: swipe
            });
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
