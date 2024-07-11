export default interface ITripData {
    "_id": string;
    "tripId": string;
    "transporter": string;
    "tripStartTime": string;
    "currentStatusCode": string;
    "currenStatus": string;
    "phoneNumber": number;
    "etaDays": number;
    "distanceRemaining": number;
    "tripEndTime": string;
    "source": string;
    "sourceLatitude": number;
    "sourceLongitude": number;
    "dest": string;
    "destLatitude": number;
    "destLongitude": number;
    "lastPingTime": string;
    "createdAt": string;
}