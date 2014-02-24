var cashwise = (function() {

    function getPurchaseId(done) {
        localforage.getItem("purchaseId", function(purchaseId) {
            purchaseId = purchaseId || 0;
            purchaseId++;
            localforage.setItem("purchaseId", purchaseId, function() {
                done(purchaseId);
            });
        });
    }

    var localDataSource = new kendo.data.DataSource({
        // sync with offline storage on every interaction
        autoSync: true,

        // declare how to persist to offline storage
        transport: {
            create: function(options) {
                var item = options.data;
                localforage.getItem("items", function(items) {
                    items = items || [];
                    getPurchaseId(function(purchaseId) {
                        item.id = purchaseId;
                        localforage.setItem("items", items.concat([item]), function() {
                            options.success([ item ]);
                        });
                    });
                });
            },
            read: function(options) {
                localforage.getItem("items", function(items) {
                    options.success(items || []);
                });
            },
            destroy: function(options) {
                var item = options.data;
                localforage.getItem("items", function(items) {
                    items = $.grep(items, function(x) { return x.id != item.id });

                    localforage.setItem("items", items, options.success);
                });
            }
        },

        // schema of the items that we are persisting
        schema: {
            model: {
                id: "id",
                fields: {
                    name: { type: "string" },
                    price: { type: "number" }
                }
            }
        }
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

    return kendo.observable({
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
        currentPurchase: {
            Name: "",
            Price: 0,
            Category: "",
            PurchasedAt: new Date()
        },
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
        },
        online: window.navigator.onLine,
        onlineClass: function() {
            return this.online ? "online": "offline";
        },
        connectionStatusChange: function() {
            this.set("online", window.navigator.onLine);

            if (this.online) {
                this.sync();
            }
        }
    });
})();
