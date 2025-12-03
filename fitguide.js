// Product dataset (you can edit names, images, sizes)
const products = [
    {
        id: "p01",
        name: "Fitted Gym Shirt",
        availableSizes: ["S", "M", "L"],
        fitType: ["compressed", "standard"],
        image: "../images/shirt01.png"
    },
    {
        id: "p02",
        name: "Training Shorts",
        availableSizes: ["M", "L", "XL"],
        fitType: ["standard"],
        image: "../images/shorts01.png"
    },
    {
        id: "p03",
        name: "Pump Cover Hoodie",
        availableSizes: ["L", "XL"],
        fitType: ["oversized", "standard"],
        image: "../images/hoodie01.png"
    }
];


// Convert measurement to size
function sizeFromChest(chest) {
    if (chest >= 80 && chest <= 92) return "S";
    if (chest >= 93 && chest <= 102) return "M";
    if (chest >= 103 && chest <= 112) return "L";
    return "XL";
}

function sizeFromWaist(waist) {
    if (waist >= 70 && waist <= 80) return "S";
    if (waist >= 81 && waist <= 90) return "M";
    if (waist >= 91 && waist <= 100) return "L";
    return "XL";
}

// Size ranking for comparing
const rank = { "S": 1, "M": 2, "L": 3, "XL": 4 };

function increaseSize(size) {
    if (size === "S") return "M";
    if (size === "M") return "L";
    if (size === "L") return "XL";
    return "XL";
}

function decreaseSize(size) {
    if (size === "XL") return "L";
    if (size === "L") return "M";
    if (size === "M") return "S";
    return "S";
}


// MAIN FUNCTION
function calculateFit() {

    let chest = parseInt(document.getElementById("chest").value);
    let waist = parseInt(document.getElementById("waist").value);
    let pref = document.getElementById("fitPreference").value;

    // Required: console log for debugging
    console.log("Fit guide measurements:", { chest, waist, pref });

    if (!chest || !waist) {
        alert("Please fill in all measurements.");
        return;
    }

    // Determine base size
    let chestSize = sizeFromChest(chest);
    let waistSize = sizeFromWaist(waist);

    let baseSize = rank[chestSize] > rank[waistSize] ? chestSize : waistSize;

    // Apply preferred fit logic
    let finalSize = baseSize;

    if (pref === "oversized") {
        finalSize = increaseSize(baseSize);
    } 
    else if (pref === "compressed") {
        finalSize = decreaseSize(baseSize);
    }

    // Show result to user
    document.getElementById("sizeResult").innerText =
        "Recommended Size: " + finalSize;

    // Filter matching products
    let matching = products.filter(p => p.availableSizes.includes(finalSize));

    // Show recommended products
    let output = "";

    matching.forEach(item => {
        output += `
            <div style='display: flex; gap: 20px; margin-bottom: 20px;'>
                <img src='${item.image}' style='width: 120px; border-radius: 10px;'>
                <div>
                    <h3>${item.name}</h3>
                    <p>Available in: ${item.availableSizes.join(", ")}</p>
                </div>
            </div>
        `;
    });

    document.getElementById("productResults").innerHTML = output;

    alert("Your recommended size has been calculated!");
}
