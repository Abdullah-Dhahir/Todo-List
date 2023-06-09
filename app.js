//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://Abdullah_Dhahir:Ss4488638Ss@cluster0.kicjuld.mongodb.net/todolistDB');

}

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Welcome to your todolist2"
});
const item3 = new Item({
  name: "Welcome to your todolist3"
});

const defaultItems = [item1, item2, item3];










app.get("/", function (req, res) {

  Item.find().then(function (foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Data inserted")  // Success
      }).catch(function (error) {
        console.log(error)      // Failure
      });

      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });// Success
    }

  }).catch(function (error) {
    console.log(error)      // Failure
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  }).catch(function (error) {
    console.log(error);     // Failure
  });
})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  })

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function (error) {
      console.log(error)
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function () {
      res.redirect("/");
      console.log("Data removed")  // Success
    }).catch(function (error) {
      console.log(error)      // Failure
    });
  } else {
    List.findByIdAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function () {
      res.redirect("/" + listName);

    }).catch(function (error) {
      console.log(error)
    });
  }

})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
