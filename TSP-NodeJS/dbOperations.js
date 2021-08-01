/** @format */

const sql = require("mssql");
//const { Polyline } = require("react-native-maps");
const config = require("./dbconnect.js");
const User = require("./Models/User");
const bcrypt = require("bcrypt");
const poolPromise = new sql.ConnectionPool(config).connect().then((pool) => {
  console.log("Connected to MSSQL");
  return pool;
});
async function Login(email, password) {
  const pool = await poolPromise;
  let query =
    "select * from Users where Email ='" + email + "' SELECT SCOPE_IDENTITY()";
  const result = await pool.request().query(query);

  if (result.recordsets[0][0] == undefined) return -1;
  res = bcrypt.compareSync(password, result.recordsets[0][0].Password);
  return res ? result.recordsets[0][0].UserId : -1;
}

async function Register(Name, Email, Password, PhoneNumber) {
  const pool = await poolPromise;

  let query =
    "insert into Users (Name,Email,Password, PhoneNumber) values ('" +
    Name +
    "','" +
    Email +
    "','" +
    Password +
    "','" +
    PhoneNumber +
    "') SELECT SCOPE_IDENTITY()";

  const result = await pool.request().query(query);

  return result.recordset[0][""];
}

async function getRouteByUserAndID(userId, RouteId) {
  const pool = await poolPromise;
  let query =
    "select UIR.UserId , R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date  from UsersInRoute as UIR join  Routes as R on UIR.RouteId = R.RouteID where UserId = " +
    userId +
    " and R.RouteID=" +
    RouteId;
  const result = await pool.request().query(query);

  let routes = result.recordsets[0];
  var newRoute = {};
  for (let element of routes) {
    const pool = await poolPromise;
    let query =
      "select R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date ,S.IsDone, S.StopID ,S.StopOrder,S.CostumerName as CustomerName, S.CustomerPhone ,S.Note, S.Address ,S.MinutesInStop ,S.Longitude , S.Latitude , S.CustomerEmail  from Routes as R join StopsInRoute as SIR on R.RouteID = SIR.RouteID join Stops as S on SIR.StopID = S.StopID join UsersInRoute as UIR on UIR.RouteID = R.RouteID where R.RouteId =" +
      +element.RouteID;

    const result = await pool.request().query(query);

    element["Stops"] = result.recordsets[0];
    newRoute[element.RouteID] = element;
  }
  return newRoute;
}

async function getALLRoutesOfUser(userId) {
  const pool = await poolPromise;
  let query =
    "select UIR.UserId , R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date  from UsersInRoute as UIR join  Routes as R on UIR.RouteId = R.RouteID where UserId = " +
    userId;
  const result = await pool.request().query(query);

  let routes = result.recordsets[0];
  var newRoute = {};
  for (let element of routes) {
    const pool = await poolPromise;
    let query =
      "select R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date ,S.IsDone, S.StopID ,S.StopOrder,S.CostumerName as CustomerName, S.CustomerPhone ,S.Note, S.Address ,S.MinutesInStop ,S.Longitude , S.Latitude , S.CustomerEmail  from Routes as R join StopsInRoute as SIR on R.RouteID = SIR.RouteID join Stops as S on SIR.StopID = S.StopID join UsersInRoute as UIR on UIR.RouteID = R.RouteID where R.RouteId =" +
      +element.RouteID;

    const result = await pool.request().query(query);

    element["Stops"] = result.recordsets[0];
    newRoute[element.RouteID] = element;
  }
  return newRoute;
}

async function AddRoute(
  UserId,
  Name,
  Origin,
  OriginLongitude,
  OriginLatitude,
  Destination,
  DestinationLongitude,
  DestinationLatitude,
  Date
) {
  try {
    const pool = await poolPromise;
    let query =
      "INSERT INTO Routes (RouteName,Origin,OriginLongitude,OriginLatitude,Destination,DestinationLongitude,DestinationLatitude,Date) values ('" +
      Name +
      "','" +
      Origin.replace(/'/g, "") +
      "','" +
      OriginLongitude +
      "','" +
      OriginLatitude +
      "','" +
      Destination.replace(/'/g, "") +
      "','" +
      DestinationLongitude +
      "','" +
      DestinationLatitude +
      "','" +
      Date +
      "') SELECT SCOPE_IDENTITY()";

    const result = await pool.request().query(query);
    query =
      "INSERT INTO UsersInRoute (RouteID,UserId) values ('" +
      result.recordset[0][""] +
      "','" +
      UserId +
      "')";

    await pool.request().query(query);
    return result.recordset[0][""];
  } catch (error) {
    console.log(error);
  }
}

async function DeleteRoute(routeId) {
  try {
    const pool = await poolPromise;
    let query = "DELETE FROM Routes where RouteId = " + routeId;

    await pool.request().query(query);

    return routeId;
  } catch (error) {
    console.log(error);
  }
}

async function AddStop(
  RouteId,
  Address,
  Lat,
  Lon,
  CustomerName,
  Customerphone,
  Note,
  Email,
  MinutesInStop,
  StopOrder,
  IsDone
) {
  try {
    const pool = await poolPromise;
    let query =
      "INSERT INTO Stops (Address,Longitude,Latitude,CustomerEmail,CostumerName,CustomerPhone,Note,MinutesInStop,StopOrder,IsDone) values ('" +
      Address.replace(/'/g, "") +
      "','" +
      Lon +
      "','" +
      Lat +
      "','" +
      Email +
      "','" +
      CustomerName +
      "','" +
      Customerphone +
      "','" +
      Note +
      "','" +
      MinutesInStop +
      "','" +
      StopOrder +
      "','" +
      IsDone +
      "') SELECT SCOPE_IDENTITY()";
    //console.log(query);
    const result = await pool.request().query(query);
    query =
      (await "INSERT INTO StopsInRoute (RouteID,StopID,StopOrder) values ('") +
      RouteId +
      "','" +
      result.recordset[0][""] +
      "','" +
      StopOrder +
      "')";
    await pool.request().query(query);
    return result.recordset[0][""];
  } catch (error) {
    console.log(error);
  }
}

async function MarkIsDone(stopId, status) {
  try {
    const pool = await poolPromise;
    let query =
      "UPDATE Stops set IsDone = '" +
      status +
      "' where StopID = '" +
      stopId +
      "'";

    await pool.request().query(query);

    return stopId;
  } catch (error) {
    console.log(error);
  }
}
async function MarkIsDone(stopId, status) {
  try {
    const pool = await poolPromise;
    let query =
      "UPDATE Stops set IsDone = '" +
      status +
      "' where StopID = '" +
      stopId +
      "'";

    await pool.request().query(query);

    return stopId;
  } catch (error) {
    console.log(error);
  }
}

async function DeleteStop(stopId, routeId, stopOrder) {
  try {
    const pool = await poolPromise;
    var query = "DELETE FROM Stops where StopID ='" + stopId + "'";

    await pool.request().query(query);

    query =
      "select R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date ,S.IsDone, S.StopID ,S.StopOrder,S.CostumerName as CustomerName, S.CustomerPhone ,S.Note, S.Address ,S.MinutesInStop ,S.Longitude , S.Latitude , S.CustomerEmail  from Routes as R join StopsInRoute as SIR on R.RouteID = SIR.RouteID join Stops as S on SIR.StopID = S.StopID where R.RouteId =" +
      routeId;
    const result = await pool.request().query(query);

    var data = result.recordset;
    if (data.length > 0 && parseInt(stopOrder) - 1 != data.length) {
      query = "UPDATE Stops SET StopOrder = (case  ";
      for (
        var index = parseInt(stopOrder) + 1;
        index <= data.length + 1;
        index++
      ) {
        let item = data.find((stop) => stop.StopOrder == index);
        query +=
          " when StopID='" + item.StopID + "' then '" + (index - 1) + "'";
      }
      query += " ELSE StopOrder end)";
      await pool.request().query(query);
    }

    return stopId;
  } catch (error) {
    console.log(error);
  }
}
async function EditRoute(
  routeId,
  Name,
  Origin,
  Destination,
  Date,
  DestinationLatitude,
  DestinationLongitude,
  OriginLatitude,
  OriginLongitude
) {
  try {
    console.log(Name);
    const pool = await poolPromise;
    let query =
      "UPDATE Routes set RouteName = '" +
      Name +
      "',Origin='" +
      Origin.replace(/'/g, "") +
      "',DestinationLatitude='" +
      DestinationLatitude +
      "',DestinationLongitude='" +
      DestinationLongitude +
      "',OriginLatitude='" +
      OriginLatitude +
      "',OriginLongitude='" +
      OriginLongitude +
      "',Destination='" +
      Destination.replace(/'/g, "") +
      "',Date='" +
      Date +
      "' where RouteID='" +
      routeId +
      "'";

    await pool.request().query(query);

    return routeId;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  Login: Login,
  Register: Register,
  getALLRoutesOfUser: getALLRoutesOfUser,
  AddRoute: AddRoute,
  DeleteRoute: DeleteRoute,
  AddStop: AddStop,
  MarkIsDone: MarkIsDone,
  DeleteStop: DeleteStop,
  EditRoute: EditRoute,
  getRouteByUserAndID: getRouteByUserAndID,
};
