CREATE TABLE vehicle(
    vehicleID int primary key auto_increment,
    reg_Number varchar(20) not null unique,
    model varchar(100) not null,
    year int not null,
    status ENUM ('Active','Under Maintanace','Retired') default 'Active',
    insurance_expiry Date,
    roadworthy_expiry Date,
    created_at timestamp default current_timestamp
);

CREATE TABLE driver(
   driverID int primary key auto_increment,
   first_name varchar(50) not null,
   last_name varchar(50) not null,
   licence_number varchar(20) not null unique,
   licence_expiry date not null,
   phone_number varchar(15),
   email varchar(100),
   created_at timestamp default current_timestamp
);

CREATE TABLE assignments(
    assignmentID int primary key auto_increment,
    vehicleID int not null, 
    assigned_date date not null,
    unassigned_date date,
    foreign key(vehicleID) references vehicles(vehicleID) onn delete cascade,
    foreign key(driverID) references drivers(driverID)on delete cascade
);

CREATE TABLE maintanace_logs(
    maintenanceID int primary key auto_increment,
    vehicleID int not  null,
    service_date date not null,
    cost decimal(10,2) not null,
    description text not null,
    service_type varchar (50),
    foreign key(vehicleID) references  vehicles(vehicleID) on delete cascade
);

CREATE TABLE expiry_alerts(
    alertID int primary key auto_increment,
    vehicleID int,
    driverID int,
    alert_type ENUM('insurance', 'Roadworthy', 'licence') not null,
    expiry_date date not null,
    is_notified boolean default false,
    
);
