var admin = require("firebase-admin");
const getTime = require("./getTime");
var serviceAccount = require("./ecommerce-xyz-firebase-adminsdk-bx5rr-580ef875c3.json");
const cronTime = require("cron-time-generator");
const schedule = require("node-schedule");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let started = false;

const tokens = {};
const jobs = {};

const db = admin.firestore();
const messaging = admin.messaging();

function cb() {
  console.log("tokens updated");
  console.log(tokens);
  if (!started) {
    startListener();
    startSchedule();
    started = true;
  } 
}

function periodicMessage(key) {
  messaging
    .sendToDevice(
      tokens[key],
      {
        notification: {
          title: "Period Notification",
          body: "Sending out periodic notification",
        },
      },
      {
        priority: "high",
        timeToLive: 60 * 60 * 24,
      }
    )
    .then((resp) => {
      console.log(resp);
    })
    .catch((err) => {
      console.error({ err });
    });
}

console.log({ offset: new Date().getTimezoneOffset() });

function startSchedule() {
  db.collection("periodic").onSnapshot((snap) => {
    const docs = snap.docs;

    docs.forEach((doc) => {
      const key = doc.id;
      const data = doc.data();

      if (data.hours && data.minutes && data.offset) {
        const hours = parseInt(data.hours);
        const minutes = parseInt(data.minutes);
        const offset = data.offset;

        const getTimeOffset = new Date().getTimezoneOffset() - offset;
        const offsetHours = Math.round(getTimeOffset / 60);
        const offsetMinutes = getTimeOffset % 60;

        const { h, m } = getTime(hours, minutes, getTimeOffset);
        const k = cronTime.everyDayAt(h, m);


        console.log({key, k});

        if (jobs[key]) {
          console.log({key, k, message: "rescheduling"});
          jobs[key].cancel();
        }
        jobs[key] = schedule.scheduleJob(k, function () {
          console.log({key, k, message: "scheduling"});
          if (tokens[key]) {
            console.log({key, k, message: "token found"});
            messaging
              .sendToDevice(
                tokens[key],
                {
                  notification: {
                    title: "Period Notification",
                    body: "Sending out periodic notification",
                  },
                },
                {
                  priority: "high",
                  timeToLive: 60 * 60 * 24,
                }
              )
              .then((resp) => {
                console.log({key, k, message: "notification sent", resp});
                console.log(resp);
              })
              .catch((err) => {
                console.log({key, k, message: "notification error", err});
                console.error({ err });
              });
          } else {
            console.log("device token not found");
            jobs[key].cancel();
            console.log({key, k, message: "removing token"});
          }
        });

        // console.log({ hours, minutes, getTimeOffset, offset, h, m, k });

        // const cronString =
      } else {
        console.log({key, k, message: "no token, deleting entry"});
        db.collection("periodic").doc(key).delete();
      }
    });
  });
}

function startListener() {
  db.collection("messages").onSnapshot((snap) => {
    const docs = snap.docs;

    docs.forEach((doc) => {
      const key = doc.id;

      const data = doc.data();

      if (data.title && data.description) {
        if (data.delay) {
          setTimeout(() => {
            messaging
              .sendToDevice(
                tokens[key],
                {
                  notification: {
                    title: data.title,
                    body: data.description,
                  },
                },
                {
                  priority: "high",
                  timeToLive: 60 * 60 * 24,
                }
              )
              .then((resp) => {
                console.log(resp);
                db.collection("messages").doc(key).delete();
              })
              .catch((err) => {
                console.error({ err });
                db.collection("messages").doc(key).delete();
              });
          }, 5000);
        } else {
          messaging
            .sendToDevice(
              tokens[key],
              {
                notification: {
                  title: data.title,
                  body: data.description,
                },
              },
              {
                priority: "high",
                timeToLive: 60 * 60 * 24,
              }
            )
            .then((resp) => {
              console.log(resp);
              db.collection("messages").doc(key).delete();
            })
            .catch((err) => {
              console.error({ err });
              db.collection("messages").doc(key).delete();
            });
        }
      }
    });
  });
}

db.collection("users").onSnapshot((snap) => {
  const docs = snap.docs;

  docs.forEach((doc) => {
    const key = doc.id;
    const data = doc.data();
    console.log(data);
    if (data.token) {
      tokens[key] = data.token;
      cb();
    }
  });
});

// async function getTokens() {
//   try {
//   } catch (err) {}
// }
