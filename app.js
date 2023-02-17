//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

mongoose.set("strictQuery", false);

mongoose.connect(
  "mongodb+srv://aae17:newcluster77@cluster0.gwrw9au.mongodb.net/todolistDB?retryWrites=true&w=majority",
  { useNewUrlParser: true,useUnifiedTopology: true},
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected Successfully to the server");
    }
  }
);

const itemsSchema = {
  name: String,
};
const itemsModel = mongoose.model("item", itemsSchema);

const item1 = new itemsModel({
  name: "Alaa",
});
const item2 = new itemsModel({
  name: "Roni",
});
const item3 = new itemsModel({
  name: "helmi",
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const listModel = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  itemsModel.find({}, function (err, results) {
    if (results.length === 0) {
      itemsModel.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Docs uploaded Successfully to the db");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  });
});

app.post("/", function (req, res) {
  const itemModel = req.body.newItem;
  const listName = req.body.list;

  const item = new itemsModel({
    name: itemModel,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    listModel.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const checkItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=="Today"){
  itemsModel.findByIdAndRemove(checkItem, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Succesfully");
      res.redirect("/");
    }
  });
}else{
  listModel.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItem}}},function(err,foundlist){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  listModel.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new listModel({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
