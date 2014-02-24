var cashwise = (function() {

    // schema of the items that we are persisting
    // used in both the local and remote datasource
    var schema = {
        model: {
            id: Everlive.idField,
            fields: {
                Name: { type: "string" },
                Price: { type: "number" },
                PurchasedAt: { type: "date" },
                Category: { type: "string" }
            }
        }
    };

    var localDataSource = new kendo.data.DataSource({
        // sync with offline storage on every interaction
        autoSync: true,

        // declare how to persist to offline storage
        transport: {
            create: function(options) {
                var item = options.data;
                localforage.getItem("items", function(items) {
                    items = items || [];
                    item.Id = kendo.guid();
                    localforage.setItem("items", items.concat([item]), function() {
                        options.success([ item ]);
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
                    items = $.grep(items, function(x) { return x.Id != item.Id });

                    localforage.setItem("items", items, options.success);
                });
            }
        },

        sort: { field: "PurchasedAt", dir: "desc" },

        schema: schema
    });

    var everlive = new Everlive("amhxJqN53yuAhdST");
    var remoteDataSource = new kendo.data.DataSource({
        type: "everlive",

        transport: {
            typeName: "Purchase"
        },

        schema: schema,

        serverSorting: true,
        sort: { field: "PurchasedAt", dir: "desc" }
    });

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
            cashwise.currentPurchase.set("Category", e.button.text());
            kendo.bind($("#purchase-form"), cashwise.currentPurchase);
        },
        logCurrentPurchase: function(e) {
            var purchase = cashwise.currentPurchase;

            purchase.set("PurchasedAt", new Date());

            purchase = $.extend({ offline: true }, purchase);

            localDataSource.add(purchase);

            purchase.set("Name", "");
            purchase.set("Price", 0);

            cashwise.closeModal();
        },
        facebookLogin: function(callback) {
            $.ajaxSetup({ cache: true });
            $.getScript('//connect.facebook.net/nl_NL/all.js', function() {
                FB.init({ appId: '255069818005059' });
                FB.getLoginStatus(function(response) {
                    if (response.status == "connected") {
                        callback(response.authResponse.accessToken);
                    } else {
                        FB.login(function(response) {
                            if (response.status == "connected") {
                                callback(response.authResponse.accessToken);
                            }
                        });
                    }
                }, { scope: "email" });
            });
        },
        sync: function() {
            cashwise.facebookLogin(function(authToken) {
                everlive.Users.loginWithFacebook(
                    authToken,
                    function() {
                        remoteDataSource.fetch(function() {
                            var pushed = false;
                            var localData = localDataSource.data().toJSON();

                            for (var i = 0; i < localData.length; i++) {
                                var item = localData[i];

                                // unsynced item, remove pseudo-id and push to remote
                                if (item.offline) {
                                    pushed = true;
                                    delete item.Id;
                                    remoteDataSource.add(item);
                                }
                            }

                            function purgeLocal() {
                                while (localDataSource.data().length) {
                                    localDataSource.remove(localDataSource.at(0));
                                }

                                var remoteData = remoteDataSource.data().toJSON();

                                for (var i = 0; i < remoteData.length; i++) {
                                    localDataSource.add(remoteData[i]);
                                }

                                localDataSource.sync();
                            }

                            if (pushed) {
                                remoteDataSource.one("change", purgeLocal);

                                remoteDataSource.sync();
                            } else {
                                purgeLocal();
                            }
                        });
                    }
                );
            });
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
