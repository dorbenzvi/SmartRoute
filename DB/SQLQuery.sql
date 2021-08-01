

-------Table -----------------------------------

create table Users(
    Email VARCHAR(100) ,
    UserId int IDENTITY(1,1) PRIMARY key,
    Name  nVARCHAR(100),
    Password VARCHAR(max),
    PhoneNumber VARCHAR(10),
    DdefaultAddress nVARCHAR(200)
)

create table Stops(
    StopID int IDENTITY(1,1) PRIMARY key,
    Address  nVARCHAR(200),
    Longitude FLOAT,
    Latitude FLOAT,
    CustomerEmail VARCHAR(100),
    CostumerName nVARCHAR(100),
    CustomerPhone VARCHAR(10),
    Note nVARCHAR(400),
    MinutesInStop int,
    StopOrder int,
    IsDone bit ,

)


select R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date ,S.IsDone, S.StopID ,S.StopOrder,S.CostumerName, S.CustomerPhone ,S.Note, S.Address ,S.MinutesInStop ,S.Longitude , S.Latitude , S.CustomerEmail  from Routes as R join StopsInRoute as SIR on R.RouteID = SIR.RouteID join Stops as S on SIR.StopID = S.StopID join UsersInRoute as UIR on UIR.RouteID = R.RouteID where R.RouteId = 19

create table Routes(
    RouteID int IDENTITY(1,1) PRIMARY key,
    RouteName  nVARCHAR(200),
    Origin  nVARCHAR(200),
    OriginLongitude FLOAT,
    OriginLatitude FLOAT,
    Destination  nVARCHAR(200),
    DestinationLongitude FLOAT,
    DestinationLatitude FLOAT,
    Date DATETIME ,
)


create table StopsInRoute(
    RouteID int ,
    StopID int ,
    StopOrder int,
    FOREIGN KEY (RouteID) REFERENCES Routes(RouteID) ON DELETE CASCADE,
    FOREIGN KEY (StopID) REFERENCES Stops(StopID) ON DELETE CASCADE,
    PRIMARY KEY(RouteID,StopID)
)



create table UsersInRoute(
    RouteID int ,
    UserId int,
    FOREIGN KEY (RouteID) REFERENCES Routes(RouteID) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    PRIMARY KEY(RouteID , UserId)
)

------ query -----




select UIR.UserId , R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date 
from UsersInRoute as UIR join  Routes as R on UIR.RouteId = R.RouteID
where UserId = 1

select R.RouteID , R.RouteName , R.Origin , R.OriginLongitude , R.OriginLatitude , R.Destination , R.DestinationLongitude , R.DestinationLatitude , R.Date ,S.IsDone, S.StopID ,S.StopOrder,S.CostumerName, S.CustomerPhone ,S.Note, S.Address ,S.MinutesInStop ,S.Longitude , S.Latitude , S.CustomerEmail  from Routes as R join StopsInRoute as SIR on R.RouteID = SIR.RouteID join Stops as S on SIR.StopID = S.StopID join UsersInRoute as UIR on UIR.RouteID = R.RouteID where R.RouteId = 19


select * from Users where Email ='1@gmail.com' and Password='1'

select * from UsersInRoute as UIR join  Routes as R on UIR.RouteId = R.RouteID  where UserId ='1'

DELETE FROM Routes 
WHERE RouteId = 1;
------------------------------------


----- Drop Table -------------------

DROP TABLE UsersInRoute;
DROP TABLE StopsInRoute;
DROP TABLE Users;
DROP TABLE Stops;
DROP TABLE Routes;

-----------------------------------



--------POSTMAN  --- -----


--add user 

{
    "Address":"נתניה",
    "Email":"ohadhaviv92@gmail.com",
    "Name":"ohad haviv",
    "Password":"1",
    "PhoneNumber":"0506595178",
}



--- add route for user id

http://localhost:51300/api/route/1

{
    "Name" : "3 route",
    "Origin" : "netanya",
    "Destination" : "bat yam",
    "Date" : "25-12-2021"
}


----add stop for route id
http://localhost:51300/api/stop/2


{
    "Address" : "haifa",
    "Lat" : "35.6",
    "Lon" : "35.7",
    "CustomerName" : "dor",
    "Customerphone" : "0547571328",
    "Note" : "some detail",
    "Email" : "a@gmail.com",
    "MinutesInStop" : 2,
    "StopOrder" : 1,
    "IsDone" : 0
}
------