const Details = require("../models/registrationDetails")
const asyncHandler = require("express-async-handler")

// Check if the user already exists based on the "matric" field
const campsData = [
    {
        id: "AB",
        state: "Abia State",
        camp: "NYSC Permanent Orientation Camp, Umunna, Bende LGA",
    },
    {
        id: "AD",
        state: "Adamawa State",
        camp: "NYSC Permanent Orientation Camp, Lapondo Road, Damare, Girei LGA",
    },
    {
        id: "AK",
        state: "Akwa Ibom State",
        camp: "NYSC Permanent Orientation Camp, Ikot Itie Udung, Nsit Atai LGA",
    },
    {
        id: "AN",
        state: "Anambra State",
        camp: "NYSC Permanent Orientation Camp, Umuawulu/Mbaukwu Awka South LGA",
    },
    {
        id: "BA",
        state: "Bauchi State",
        camp: "NYSC Permanent Orientation Camp, KM 60 Wailo, Ganjuwa LGA",
    },
    {
        id: "BY",
        state: "Bayelsa State",
        camp: "Kaiama Grammar School, Kaiama, Kolokoma-Opokuma LGA",
    },
    {
        id: "BN",
        state: "Benue State",
        camp: "NYSC Permanent Orientation Camp, Wannune, Tarka LGA",
    },
    {
        id: "BO",
        state: "Borno State",
        camp: "College of Peace and Disaster Management, Babbar-Ruga Batsari Road, Katsina",
    },
    {
        id: "CR",
        state: "Cross River State",
        camp: "NYSC Permanent Orientation Camp, Obubra, Obubra LGA",
    },
    {
        id: "DT",
        state: "Delta State",
        camp: "NYSC Permanent Orientation Camp, Former Martins TTC, Issele-Uku, Aniocha North LGA",
    },
    {
        id: "EB",
        state: "Ebonyi State",
        camp: "NYSC Permanent Orientation Camp, Macgregor College, Afikpo LGA",
    },
    {
        id: "ED",
        state: "Edo State",
        camp: "Okada Grammar School, Okada, Ovia North-East LGA",
    },
    {
        id: "EK",
        state: "Ekiti State",
        camp: "NYSC Permanent Orientation Camp, Ise-Orun/Emure LGA",
    },
    {
        id: "EN",
        state: "Enugu State",
        camp: "NYSC Permanent Orientation Camp, Awgu LGA",
    },
    {
        id: "FC",
        state: "FCT (Abuja)",
        camp: "NYSC Permanent Orientation Camp, Kubwa, Bwari Area Council",
    },
    {
        id: "GM",
        state: "Gombe State",
        camp: "NYSC Temporary Orientation Camp, Science Technical College, Amada",
    },
    {
        id: "IM",
        state: "Imo State",
        camp: "NYSC Temporary Orientation Camp, Former Girl's Model Secondary School Eziama Obaire, Nkwerre LGA",
    },
    {
        id: "JG",
        state: "Jigawa State",
        camp: "NYSC Permanent Camp, opposite Army Barrack, Fanisua Dutse LGA",
    },
    {
        id: "KD",
        state: "Kaduna State",
        camp: "NYSC Permanent Orientation Camp, Kaduna – Abuja Road",
    },
    {
        id: "KN",
        state: "Kano State",
        camp: "NYSC Permanent Orientation Camp, Kusala Dam, Karaye, Karaye LGA",
    },
    {
        id: "KT",
        state: "Katsina State",
        camp: "Youth Multi-purpose Centre/ NYSC Permanent Orientation Camp, Mani Road",
    },
    {
        id: "KB",
        state: "Kebbi State",
        camp: "NYSC Permanent Orientation Camp, Dakingari LGA",
    },
    {
        id: "KG",
        state: "Kogi State",
        camp: "NYSC Permanent Orientation Camp, Asaya, Kabba LGA",
    },
    {
        id: "KW",
        state: "Kwara State",
        camp: "NYSC Permanent Orientation Camp, Yikpata, Edu LGA",
    },
    {
        id: "LA",
        state: "Lagos State",
        camp: "NYSC Permanent Orientation Camp, Iyana Ipaja, Agege",
    },
    {
        id: "NS",
        state: "Nassarawa State",
        camp: "Magaji Dan-Yamusa Permanent Orientation Camp, Keffi",
    },
    {
        id: "NG",
        state: "Niger State",
        camp: "NYSC Permanent Orientation Camp, Paiko",
    },
    {
        id: "OG",
        state: "Ogun State",
        camp: "NYSC Permanent Orientation Camp, Ikenne Road, Sagamu LGA",
    },
    {
        id: "OD",
        state: "Ondo State",
        camp: "NYSC Permanent Orientation Camp, Ikare-Akoko LGA",
    },
    {
        id: "OS",
        state: "Osun State",
        camp: "NYSC Permanent Orientation Camp, Aisu College Hospital Road, Ede North LGA",
    },
    {
        id: "OY",
        state: "Oyo State",
        camp: "Government Technical College, Iseyin LGA",
    },
    {
        id: "PL",
        state: "Plateau State",
        camp: "NYSC Permanent Orientation Camp, Mangu, Mangu LGA",
    },
    {
        id: "RV",
        state: "Rivers State",
        camp: "NYSC Permanent Orientation Camp, Nonwa-Gbam Tai LGA",
    },
    {
        id: "SO",
        state: "Sokoto State",
        camp: "NYSC Permanent Orientation Camp, Wamakko, Wamakko LGA",
    },
    {
        id: "TR",
        state: "Taraba State",
        camp: "NYSC Permanent Orientation Camp, Sibre Airport Road, Jalingo",
    },
    {
        id: "YB",
        state: "Yobe State",
        camp: "NYSC Permanent Orientation Camp Dazigau, Nangere LGA",
    },
    {
        id: "ZM",
        state: "Zamfara",
        camp: "NYSC Permanent Orientation Camp, Beside FRSC Office, Tsafe LGA",
    },
]

// Function to get a random city
function getRandomCamp() {
    const randomIndex = Math.floor(Math.random() * campsData.length)
    return campsData[randomIndex]
}

//generate random number
function generateRandomNumber() {
    return Math.floor(1000000 + Math.random() * 9000000)
}

const registerUser = async (req, res, next) => {
    const matric = req.body.matric

    try {
        const findDetails = await Details.findOne({ matric: matric })
        if (!findDetails) {
            const randomCamp = getRandomCamp()
            const newUser = {
                ...req.body,
                statePostedTo: randomCamp.state,
                OrientationCamp: randomCamp.camp,
                CallUpNumber: `NYSC/DEMO/${generateRandomNumber()}`,
            } // Add camp and statePostedTo to the user data
            const registerNewUser = await Details.create(newUser)
            res.status(201).json({
                message: "User registered successfully",
                user: registerNewUser,
            })
        } else {
            res.status(409).json({ error: "User Already Registered" })
        }
    } catch (err) {
        res.status(500).json({ error: "Error while registering user" })
    }
}

const deleteDetails = asyncHandler(async (req, res) => {
    const { id } = req.params
    const deletedDetails = await Details.findByIdAndDelete(id)

    if (!deletedDetails) {
        // If no document was found with the given ID, return a 404 response
        return res.status(404).json({ error: "Details not found" })
    }

    // If the document was successfully deleted, return a success response
    res.json({ message: "Details deleted successfully", deletedDetails })
})

const getaUserDetails = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const user = await Details.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        res.json(user)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    // validateMongoDb(_id);
    try {
        const updatedUser = await Details.findByIdAndUpdate(id, req.body, {
            new: true,
        })
        res.json({
            updatedUser,
        })
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = updateUser

module.exports = {
    registerUser,
    deleteDetails,
    getaUserDetails,
    updateUser,
}
