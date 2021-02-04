ecommerce-fb-admin

Push Notification Showcase


Install node.js , open terminal navigate to this folder and do 
`npm i`.

PS this is already hosted so you wont need to run it locally and It needs a service file which i won't be attaching for privacy reasons.

For self notification, set the message in

collection("messages").doc($uid).set({ 
    title: "...", 
    description: ".." //body 
    delay: true/false //adds a 5 second delay if true 
})

For periodic notification, set the hours minutes and timezone offset in

collection("periodic").doc($uid).set({ 
    hours: "...", 
    minutes: "..", 
    offset: -330 //number 
})

The users must save their tokens in

collection("users").doc($uid).set({ token: "..." })
