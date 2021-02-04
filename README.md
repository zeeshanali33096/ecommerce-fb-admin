# ecommerce-fb-admin

Push Notification showcase

For self notification, set the message in 

collection("messages").doc(`$uid`).set({
  title: "...",
  description: ".." //body
  delay: true/false //adds a 5 second delay if true
})


For periodic notification, set the hours minutes and timezone offset in 


collection("periodic").doc(`$uid`).set({
  hours: "...",
  minutes: ".." 
  offset: -330 //number
})


The users must save their tokens in

collection("users").doc(`$uid`).set({
  token: "..."
})
