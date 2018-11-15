const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const compression = require("compression")
const VoiceResponse = require("twilio").twiml.VoiceResponse
const MessagingResponse = require("twilio").twiml.MessagingResponse
require("dotenv").config()
var middleware = require("./mw")

const app = express()
const port = process.env.PORT || 3000

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_ACCOUNT_TOKEN
const client = require("twilio")(accountSid, authToken)

const voice = { voice: "man", language: "en-us" }

app.use(middleware.useHttps)
app.use(middleware.useWww)
app.use(helmet())
app.use(compression())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"))
})

app.post("/call", (req, res) => {
  const twiml = new VoiceResponse()

  twiml.say(
    voice,
    "Welcome to voip check. Please listen to the next five words."
  )
  twiml.pause({ length: 1 })

  const words = ["alpha", "beta", "gamma", "delta", "epsilon"]

  for (const word of words) {
    twiml.say(voice, word)
    twiml.pause({ length: 1 })
  }

  twiml.say(
    voice,
    "Please record a short message and I will play it back. Press the star key when finished."
  )
  twiml.record({
    action: "/record",
    method: "POST",
    maxLength: 20,
    finishOnKey: "*"
  })

  res.type("text/xml")
  res.send(twiml.toString())
})

app.post("/record", (req, res) => {
  const { RecordingUrl, RecordingSid } = req.body
  const twiml = new VoiceResponse()

  twiml.play({}, RecordingUrl)
  twiml.pause({ length: 1 })
  twiml.say(voice, "goodbye")

  client.recordings(RecordingSid).remove(err => {
    if (err) console.error("Error deleting recording", err)
    res.type("text/xml")
    res.send(twiml.toString())
  })
})

app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse()
  twiml.message(`Check us out at https://${process.env.SITE_DOMAIN}`)
  res.type("text/xml")
  res.send(twiml.toString())
})

app.listen(port, () => console.log(`Server is running on port ${port}`))
