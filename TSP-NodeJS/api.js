/** @format */
require("dotenv").config();
const DB = require("./dbOperations");
const TSP = require("./tsp");
const User = require("./Models/User");
var moment = require("moment");
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var xlsx = require("./local_node_modules/json-as-xlsx");
const { writeFileSync } = require("fs");
const { request, response } = require("express");
const HE = require("./handleEmail");
var app = express();
var router = express.Router();
var requesta = require("request");
const fetch = require("node-fetch");
var ws_name = "SheetJS";
const bcrypt = require("bcrypt");
const saltRounds = 10;
const multer = require("multer");
("use strict");
const excelToJson = require("convert-excel-to-json");
var storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.endsWith(".xlsx")) {
      return cb(new Error("File must be a xlsx"));
    }
    cb(undefined, true);

    // cb(new Error('File must be a csv or xlsx file'))
    // cb(undefined,true)
    // cb(undefined,false)
  },
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors());
app.use("/api", router);
var ip = require("ip");
const { selectParentsPairs } = require("./genemo/lib/reproduceBatch");

var port = 51300;

app.listen(port, ip.address());
console.log("API Running On:", ip.address() + ":" + port);

router.route("/download").get((request, response) => {
  DB.getRouteByUserAndID(request.query.userId, request.query.RouteId).then(
    (result) => {
      var columns = [
        { label: "Route Name", value: "RouteName" },
        { label: "From", value: "From" },
        { label: "To", value: "To" },
        { label: "Start Date", value: "StartDate" },
      ];
      var stopsColumns = [
        { label: "Address", value: "Address" },
        { label: "CustomerName", value: "CustomerName" },
        { label: "CustomerPhone", value: "CustomerPhone" },
        { label: "CustomerEmail", value: "CustomerEmail" },
        { label: "Note", value: "Note" },
        { label: "MinutesInStop", value: "MinutesInStop" },
      ];
      var settings = {
        sheetName: "Route Info", //The name of the sheet
        fileName: "MySpreadsheet", //The name of the spreadsheet
        extraLength: 3, //A bigger number means that columns should be wider
        writeOptions: {}, //Style options from https://github.com/SheetJS/sheetjs#writing-options
      };

      var routeInfo = [
        {
          RouteName: result[request.query.RouteId].RouteName,
          From: result[request.query.RouteId].Origin,
          To: result[request.query.RouteId].Destination,
          StartDate: result[request.query.RouteId].Date,
        },
      ];

      let stopInfo = [];
      for (let i = 0; i < result[request.query.RouteId].Stops.length; i++) {
        stopInfo.push({
          Address: result[request.query.RouteId].Stops[i].Address,
          CustomerName: result[request.query.RouteId].Stops[i].CostumerName,
          CustomerPhone: result[request.query.RouteId].Stops[i].CustomerPhone,
          Note: result[request.query.RouteId].Stops[i].Note,
          MinutesInStop: result[request.query.RouteId].Stops[i].MinutesInStop,
          CustomerEmail: result[request.query.RouteId].Stops[i].CustomerEmail,
        });
      }

      var buffer = xlsx(
        columns,
        stopsColumns,
        routeInfo,
        stopInfo,
        settings,
        false
      );
      console.log("Exported");
      response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-disposition":
          "attachment; filename=Route" + request.query.RouteId + ".xlsx",
      });
      response.end(buffer);
    }
  );
});

router.route("/upload").post(upload.single("upload"), (request, response) => {
  const result = excelToJson({
    sourceFile: request.file.path,
    header: {
      rows: 1,
    },
  });

  //Delete the file after the parse to JSON
  fs.unlink(request.file.path, function (err) {
    if (err) throw err;
    console.log("File deleted!");
  });

  Origin = result["Route Info"][0]["B"];
  Destination = result["Route Info"][0]["C"];
  OriginLongitude = "";
  OriginLatitude = "";
  DestinationLongitude = "";
  DestinationLatitude = "";
  requesta.get(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      result["Route Info"][0]["B"] +
      "&key=" +
      process.env.GOOGLE_API,

    function (err, res, body) {
      let location = JSON.parse(body).results[0].geometry.location;

      OriginLongitude = location.lng;
      OriginLatitude = location.lat;
      requesta.get(
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          result["Route Info"][0]["C"] +
          "&key=" +
          process.env.GOOGLE_API,

        function (err, res, body) {
          let location = JSON.parse(body).results[0].geometry.location;

          DestinationLongitude = location.lng;
          DestinationLatitude = location.lat;

          routeName = result["Route Info"][0]["A"];
          date = moment(result["Route Info"][0]["D"]).format(
            "YYYY-MM-DD HH:mm"
          );

          var route;
          DB.AddRoute(
            request.body.userId,
            routeName,
            Origin,
            OriginLongitude,
            OriginLatitude,
            Destination,
            DestinationLongitude,
            DestinationLatitude,
            date
          ).then((id) => {
            route = {
              Id: id,
              RouteName: routeName,
              Origin: Origin,
              OriginLongitude: OriginLongitude,
              OriginLatitude: OriginLatitude,
              Destination: Destination,
              DestinationLongitude: DestinationLongitude,
              DestinationLatitude: DestinationLatitude,
              Date: date,
              Stops: [],
            };

            var stops = [];
            result["Stops Info"].forEach((element, index) => {
              requesta.get(
                "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                  element["A"] +
                  "&key=" +
                  process.env.GOOGLE_API,

                function (err, res, body) {
                  console.log(JSON.parse(body));
                  let location = JSON.parse(body).results[0].geometry.location;

                  var Longitude = location.lng;
                  var Latitude = location.lat;

                  DB.AddStop(
                    id,
                    element["A"],
                    Latitude,
                    Longitude,
                    element["B"],
                    element["C"],
                    element["E"],
                    element["D"],
                    element["F"],
                    index + 1,
                    0
                  ).then((stopId) => {
                    stops.push({
                      Address: element["A"],
                      Latitude: Latitude,
                      Longitude: Longitude,
                      CustomerName: element["B"],
                      CustomerPhone: element["c"],
                      Note: element["E"],
                      Email: element["D"],
                      MinutesInStop: element["F"],
                      StopOrder: index + 1,
                      IsDone: 0,
                      StopID: stopId,
                    });

                    if (stops.length == result["Stops Info"].length) {
                      route["Stops"] = stops;

                      response.end(JSON.stringify(route));
                    }
                  });
                }
              );
            });
            //console.log(result["Stops Info"].length);
          });
        }
      );
    }
  );
});

router.route("/User").get((request, response) => {
  DB.Login(request.query.email, request.query.password).then((result) => {
    result === -1
      ? response.status(401).end(result + "")
      : response.status(200).end(result + "");
  });
});

router.route("/User").post((request, response) => {
  if (request.body.phoneNumber === "Google") {
    DB.Login(request.body.email, request.body.password).then((result) => {
      if (result !== -1) response.status(200).end(result + "");
      else {
        bcrypt.hash(request.body.password, saltRounds, function (err, hash) {
          DB.Register(
            request.body.name,
            request.body.email,
            hash,
            request.body.phoneNumber
          ).then((result) => {
            response.status(200).end(result + "");
          });
        });
      }
    });
  } else {
    bcrypt.hash(request.body.password, saltRounds, function (err, hash) {
      DB.Register(
        request.body.name,
        request.body.email,
        hash,
        request.body.phoneNumber
      ).then((result) => {
        response.status(200).end(result + "");
      });
    });
  }
});

router.route("/Route").get((request, response) => {
  DB.getALLRoutesOfUser(request.query.userId).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Route/:userId").post((request, response) => {
  DB.AddRoute(
    request.params.userId,
    request.body.RouteName,
    request.body.Origin,
    request.body.OriginLongitude,
    request.body.OriginLatitude,
    request.body.Destination,
    request.body.DestinationLongitude,
    request.body.DestinationLatitude,
    request.body.Date
  ).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Route/:routeId").delete((request, response) => {
  DB.DeleteRoute(request.params.routeId).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Stop/:routeId").post((request, response) => {
  DB.AddStop(
    request.params.routeId,
    request.body.Address,
    request.body.Lat,
    request.body.Lon,
    request.body.CustomerName,
    request.body.Customerphone,
    request.body.Note,
    request.body.Email,
    request.body.MinutesInStop,
    request.body.StopOrder,
    request.body.IsDone
  ).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Tsp").post((request, response) => {
  TSP.Genetic(request.body, response);
});

router.route("/Stop/:stopId/:status").put((request, response) => {
  DB.MarkIsDone(request.params.stopId, request.params.status).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Stop").delete((request, response) => {
  DB.DeleteStop(
    request.query.stopId,
    request.query.routeId,
    request.query.stopOrder
  ).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

router.route("/Route/:routeId").put((request, response) => {
  DB.EditRoute(
    request.params.routeId,
    request.body.RouteName,
    request.body.Origin,
    request.body.Destination,
    request.body.Date,
    request.body.DestinationLatitude,
    request.body.DestinationLongitude,
    request.body.OriginLatitude,
    request.body.OriginLongitude
  ).then((result) => {
    response.status(200).end(JSON.stringify(result));
  });
});

//Example to test


// still need to get data on stops(JSON)

router.route("/sendMail").post((request, response) => {
  HE.sendMailToClient(jsonstop);
  response.status(200).end("Sent!");
});
