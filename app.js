//IIFE
//Budget Controller
var budgetController = (function() {
    //this is an object
    //an object starts with capital letter
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    //constructor add a method into a prototype, because all of the objects that are created through this expense prototype will then inherit this method because of the prototype chain, because it's in their prototype so the prototype property of expense
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach((cur) => {
            //value from this.value
            sum = sum + cur.value;
        });
        data.totals[type] = sum;

        /*
        example foreach loop
            0
            [200, 400, 100]

            sum = 0 + 200
            sum = 200 + 400
            sum = 600 + 100 = 700
        */
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        //if there are no values or income, there are no percentage
        // -1 means doesn't exists
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //Create New ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new Item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            //loop, map returns brand new array
            ids= data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                //splice is used to remove element
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
            //examples
            //expense = 100 and income = 200, spent 50% = 100/200 = 0.5 * 100
        },

        calculatePercentages: function(){
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100 = 20%
            b= 10/100 = 10%
            c= 40/100 = 40% */

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                //call the getPercentage method and return & store it into allPerc arr 
                return cur.getPercentage();
            });
            //and then we return
            return allPerc;
        },

        getBudget: function() {
            //to return a data
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
}) ();

//UI Controller, cannot be private because will be used on another function
var UIController = (function() {
    //private variable
    var DOMstrings = {
        inputType: '.add__type', //Will be either inc or exp (income or expenses)
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        /* + or - before number
        exacly 2 decimal points
        comma separating the thousands
        2,310.4567 -> 2,310.46
        */
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];           

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var NodeListForEach = function(list, callback) {
        //nodeList also has length property
        for(var i = 0; i < list.length; i++) {
            //first class function
            callback(list[i], i);
        }
    };

    //return public object
    return {
        getInput: function() {
            //return an object as properties, this is a method for returning all three inputs in the user interface
            return {
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, e;

            //Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';

            } else if (type ==='exp') {
                element = DOMstrings.expensesContainer;
            
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        
            fieldsArr = Array.prototype.slice.call(fields);
            
            //function is a callback function & can receive up to 3 arg
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');           
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            // document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            var fields;

            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            NodeListForEach(fields, function(current, index){
                //do stuff
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';   
                } else {
                    current.textContent = '---';
                } 
            });
        },

        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        

        changedType: function() {
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            NodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');

            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings; 
        }
    }
})();

//Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
    
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };
    
    var updatePercentages = function() {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //5. Display the budget on the UI.
        UICtrl.displayBudget(budget);

    };

    //module can receive arguments
    var ctrlAddItem = function() {
        var input, newItem;

        //1. Get the Field Input Data
        input = UICtrl.getInput();
        // console.log(input); //happens asap hit the enter key & btn
       
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update Budget.
            updateBudget();

            //6. Calculate and update percentages.
            updatePercentages();
        }
        
    };

    //event is used to know what target element
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        //DOM tranversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages.
            updatePercentages();
        }

    };

    //return an object
    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);


//without this code, nothing is ever going to happen because there will be no event listeners, and without event listeners we cannot input data and without data, there is no application
controller.init();