const path = require("path");
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.use(cors());
// mongodb관련 모듈
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("db 연결");
  if (err) {
    console.log(err);
  } else {
    console.log("crud app 연결");
  }
  db = client.db("crudapp");
});
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/write", (req, res) => {
  //res.sendFile(path.join(__dirname, "public/html/write.html"));
  res.render("write");
});
app.post("/add", (req, res) => {
  db.collection("counter").findOne({ name: "total" }, (err, result) => {
    const total = result.totalPost;
    const subject = req.body.subject;
    const contents = req.body.contents;
    console.log(subject);
    console.log(contents);
    const insertData = {
      no: total + 1,
      subject: subject,
      contents: contents,
    };
    db.collection("crud").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "total" }, { $inc: { totalPost: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        //console.log("잘 들어갔음");
        //res.send(`<script>alert("글이 입력되었습니다."); location.href="/list"</script>`);
        res.send("aaa");
      });
    });
  });

  //res.sendFile(path.join(__dirname, "public/html/result.html"));
  //res.redirect("/list");
});
// 불면확한 데이터 처리할때 noSql (몽고db) 사용
app.get("/list", (req, res) => {
  //crud에서 데이터 받아보기
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      //res.send(); res.json();res.sendFile();
      res.render("list", { list: result, title: "테스트용입니다." }); //   페이지 내가 만들어서 보내주기
      //res.json(result);
    });
});
app.get("/detail/:no", (req, res) => {
  console.log(req.params.no);
  const no = parseInt(req.params.no);
  db.collection("crud").findOne({ no: no }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result);
      res.render("detail", { subject: result.subject, contents: result.contents });
    }
  });
  //res.render("detail");
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
