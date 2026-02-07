/* ================================================================
   Happy Hour Shipping Estimator
   USPS Ground Advantage (Retail) from Syracuse NY 13206
   ================================================================ */

(function () {
  "use strict";

  /* ── ZIP3 → Zone table (origin prefix 132) ─────────────────── */
  // Each entry: [startZip3, endZip3, zone]
  // Single entries use same start/end.
  const ZIP3_ZONES = [
    [5, 5, 3],
    [6, 9, 7],
    [10, 24, 3],
    [25, 26, 4],
    [27, 40, 3],
    [41, 41, 4],
    [42, 42, 3],
    [43, 49, 4],
    [50, 89, 3],
    [90, 99, 3],   // 3+ exceptions handled separately
    [100, 119, 3],
    [120, 129, 2],
    [130, 132, 1],
    [133, 137, 2],
    [138, 138, 1],
    [139, 149, 2],
    [150, 166, 3],
    [167, 167, 3],
    [168, 168, 3],
    [169, 169, 2],
    [170, 176, 3],
    [177, 178, 2],
    [179, 181, 3],
    [182, 188, 2],
    [189, 205, 3],
    [206, 206, 4],
    [207, 212, 3],
    [214, 217, 3],
    [218, 218, 4],
    [219, 219, 3],
    [220, 221, 4],
    [222, 223, 3],
    [224, 225, 4],
    [226, 226, 3],
    [227, 253, 4],
    [254, 254, 3],
    [255, 266, 4],
    [267, 267, 3],
    [268, 268, 4],
    [270, 283, 4],
    [284, 284, 5],
    [285, 286, 4],
    [287, 323, 5],
    [324, 325, 6],
    [326, 326, 5],
    [327, 342, 6],
    [344, 344, 6],
    [346, 347, 6],
    [349, 349, 6],
    [350, 352, 5],
    [354, 364, 5],
    [365, 366, 6],
    [367, 375, 5],
    [376, 376, 4],
    [377, 386, 5],
    [387, 387, 6],
    [388, 389, 5],
    [390, 396, 6],
    [397, 399, 5],
    [400, 400, 4],
    [401, 401, 5],
    [402, 418, 4],
    [420, 427, 5],
    [430, 439, 4],
    [440, 440, 3],
    [441, 443, 4],
    [444, 445, 3],
    [446, 470, 4],
    [471, 471, 5],
    [472, 473, 4],
    [474, 478, 5],
    [479, 498, 4],
    [499, 510, 5],
    [511, 511, 6],
    [512, 516, 5],
    [520, 528, 5],
    [530, 531, 5],
    [532, 532, 4],
    [534, 534, 4],
    [535, 535, 5],
    [537, 541, 5],
    [542, 543, 4],
    [544, 551, 5],
    [553, 564, 5],
    [565, 565, 6],
    [566, 566, 5],
    [567, 567, 6],
    [570, 577, 6],
    [580, 588, 6],
    [590, 597, 7],
    [598, 599, 8],
    [600, 601, 5],
    [602, 603, 4],
    [604, 605, 5],
    [606, 608, 4],
    [609, 620, 5],
    [622, 631, 5],
    [633, 641, 5],
    [644, 646, 5],
    [647, 648, 6],
    [649, 655, 5],
    [656, 656, 6],
    [657, 658, 5],
    [660, 662, 6],
    [664, 681, 6],
    [683, 693, 6],
    [700, 701, 6],
    [703, 708, 6],
    [710, 714, 6],
    [716, 722, 6],
    [723, 725, 5],
    [726, 731, 6],
    [733, 733, 7],
    [734, 738, 6],
    [739, 739, 7],
    [740, 741, 6],
    [743, 763, 6],
    [764, 765, 7],
    [766, 767, 6],
    [768, 769, 7],
    [770, 770, 6],
    [772, 773, 6],
    [774, 774, 7],
    [775, 778, 6],
    [779, 798, 7],
    [799, 799, 8],
    [800, 806, 7],
    [807, 807, 6],
    [808, 816, 7],
    [820, 831, 7],
    [832, 833, 8],
    [834, 834, 7],
    [835, 838, 8],
    [840, 840, 7],
    [841, 844, 8],
    [845, 845, 7],
    [846, 847, 8],
    [850, 853, 8],
    [855, 857, 8],
    [859, 860, 8],
    [863, 865, 8],
    [870, 871, 7],
    [873, 873, 8],
    [874, 875, 7],
    [876, 876, 8],
    [877, 877, 7],
    [878, 880, 8],
    [881, 884, 7],
    [885, 885, 8],
    [889, 891, 8],
    [893, 895, 8],
    [897, 898, 8],
    [900, 908, 8],
    [910, 928, 8],
    [930, 961, 8],
    [962, 966, 8],  // 8+ base; ZIP5 exceptions below
    [968, 968, 8],
    [969, 969, 9],  // 9+ base; ZIP5 exceptions override some to 8
    [970, 986, 8],
    [988, 999, 8],
  ];

  // Special ZIP3 entry for 96700 (single ZIP5 mapped to zone 8)
  // Handled: 967xx falls in range 962-966 (zone 8) or 968 (zone 8).
  // 96700 is in ZIP3 967 which is NOT in any range above.
  // We add it as a single ZIP3 entry.
  ZIP3_ZONES.push([967, 967, 8]);

  /* ── ZIP5 exceptions ──────────────────────────────────────── */
  // Weight-dependent exceptions (apply only when weight < 16 oz)
  const ZIP5_WEIGHT_EXCEPTIONS = [
    { start: 9000, end: 9999, zone: 4 },    // APO/FPO
    { start: 96200, end: 96699, zone: 4 },   // Pacific territories
  ];

  // Always-apply ZIP5 exceptions (force zone regardless of weight)
  const ZIP5_ALWAYS_EXCEPTIONS = [
    { start: 96900, end: 96999, zone: 8 },
    { start: 96945, end: 96959, zone: 8 },
    { start: 96961, end: 96969, zone: 8 },
    { start: 96971, end: 96999, zone: 8 },
  ];

  /* ── USPS Ground Advantage Retail rates ───────────────────── */
  // Each row: [maxOz, [z1, z2, z3, z4, z5, z6, z7, z8, z9]]
  const RATE_TABLE = [
    [4,      [7.30, 7.45, 7.55, 7.70, 7.95, 8.10, 8.30, 8.75, 8.75]],
    [8,      [7.30, 7.45, 7.55, 7.70, 7.95, 8.10, 8.30, 8.75, 8.75]],
    [12,     [8.85, 9.20, 9.45, 9.80, 10.15, 10.50, 11.05, 11.95, 11.95]],
    [15.999, [8.85, 9.20, 9.45, 9.80, 10.15, 10.50, 11.05, 11.95, 11.95]],
    [16,     [8.85, 9.20, 9.45, 9.80, 10.15, 10.50, 11.05, 11.95, 11.95]],
    [32,     [10.00, 10.65, 11.30, 12.05, 13.05, 14.00, 15.25, 17.65, 17.65]],
    [48,     [10.45, 11.10, 11.70, 12.70, 13.85, 15.25, 17.55, 20.75, 20.75]],
    [64,     [11.35, 11.80, 12.65, 13.75, 15.20, 16.95, 19.35, 22.45, 22.45]],
    [80,     [12.00, 12.55, 13.45, 14.65, 16.15, 18.15, 20.75, 24.10, 24.10]],
    [96,     [12.50, 12.85, 13.75, 15.15, 17.05, 19.50, 22.55, 26.25, 26.25]],
    [112,    [12.95, 13.35, 14.25, 15.85, 18.00, 20.90, 24.30, 28.35, 28.35]],
    [128,    [13.50, 13.75, 14.65, 16.35, 18.90, 22.30, 26.35, 30.70, 30.70]],
    [144,    [14.00, 14.25, 15.05, 16.95, 19.80, 23.65, 28.45, 33.05, 33.05]],
    [160,    [14.75, 15.10, 15.95, 17.95, 21.15, 25.45, 30.85, 36.55, 36.55]],
  ];

  // Readable bracket labels for display
  const BRACKET_LABELS = [
    "4 oz", "8 oz", "12 oz", "15.999 oz", "1 lb (16 oz)",
    "2 lb", "3 lb", "4 lb", "5 lb", "6 lb", "7 lb", "8 lb", "9 lb", "10 lb"
  ];

  /* ── Square shipping fee tiers ────────────────────────────── */
  // [minLb, maxLb, fee, label]
  const SQUARE_TIERS = [
    [0.0000, 0.4999, 7.99,  "0 to 0.4999 lb"],
    [0.5000, 1.0000, 10.99, "0.5 to 1.0 lb"],
    [1.0001, 2.0000, 12.99, "1.0001 to 2.0 lb"],
    [2.0001, 3.0000, 14.99, "2.0001 to 3.0 lb"],
    [3.0001, 4.0000, 16.99, "3.0001 to 4.0 lb"],
    [4.0001, 5.0000, 17.99, "4.0001 to 5.0 lb"],
    [5.0001, 6.0000, 18.99, "5.0001 to 6.0 lb"],
    [6.0001, 7.0000, 19.99, "6.0001 to 7.0 lb"],
    [7.0001, 8.0000, 20.99, "7.0001 to 8.0 lb"],
    [8.0001, 9.0000, 21.99, "8.0001 to 9.0 lb"],
    [9.0001, Infinity, 22.99, "9.0001 lb and up"],
  ];

  /* ── Zone lookup ──────────────────────────────────────────── */
  function lookupZone(zip5Str, weightOz) {
    var zip5 = parseInt(zip5Str, 10);
    var zip3 = parseInt(zip5Str.substring(0, 3), 10);
    var zone = null;
    var exceptionNote = null;

    // 1) Check always-apply ZIP5 exceptions (most specific first)
    for (var i = ZIP5_ALWAYS_EXCEPTIONS.length - 1; i >= 0; i--) {
      var ex = ZIP5_ALWAYS_EXCEPTIONS[i];
      if (zip5 >= ex.start && zip5 <= ex.end) {
        zone = ex.zone;
        exceptionNote = "ZIP5 exception: " + zip5Str + " in range " +
          String(ex.start).padStart(5, "0") + "-" + String(ex.end).padStart(5, "0") +
          " forced to zone " + ex.zone;
        break;
      }
    }

    // 2) Check weight-dependent ZIP5 exceptions
    if (zone === null) {
      for (var j = 0; j < ZIP5_WEIGHT_EXCEPTIONS.length; j++) {
        var wex = ZIP5_WEIGHT_EXCEPTIONS[j];
        if (zip5 >= wex.start && zip5 <= wex.end) {
          if (weightOz < 16) {
            zone = wex.zone;
            exceptionNote = "ZIP5 exception: " + zip5Str + " in range " +
              String(wex.start).padStart(5, "0") + "-" + String(wex.end).padStart(5, "0") +
              " (Ground Advantage < 16 oz) overridden to zone " + wex.zone;
          } else {
            exceptionNote = "ZIP5 " + zip5Str + " is in exception range " +
              String(wex.start).padStart(5, "0") + "-" + String(wex.end).padStart(5, "0") +
              " but weight >= 16 oz, so ZIP3 rule applies.";
          }
          break;
        }
      }
    }

    // 3) Fall back to ZIP3 table
    if (zone === null) {
      for (var k = 0; k < ZIP3_ZONES.length; k++) {
        var rule = ZIP3_ZONES[k];
        if (zip3 >= rule[0] && zip3 <= rule[1]) {
          zone = rule[2];
          break;
        }
      }
    }

    return { zone: zone, exceptionNote: exceptionNote };
  }

  /* ── Rate lookup ──────────────────────────────────────────── */
  function lookupRate(zone, weightOz) {
    for (var i = 0; i < RATE_TABLE.length; i++) {
      if (weightOz <= RATE_TABLE[i][0]) {
        var bracketLabel = BRACKET_LABELS[i];
        var rate = RATE_TABLE[i][1][zone - 1]; // zone 1 = index 0
        return { rate: rate, bracketMaxOz: RATE_TABLE[i][0], bracketLabel: bracketLabel, bracketIndex: i };
      }
    }
    return null; // over 10 lb
  }

  /* ── Square fee lookup ────────────────────────────────────── */
  function lookupSquareFee(weightLb) {
    for (var i = 0; i < SQUARE_TIERS.length; i++) {
      var tier = SQUARE_TIERS[i];
      if (weightLb >= tier[0] && weightLb <= tier[1]) {
        return { fee: tier[2], label: tier[3] };
      }
    }
    // Should not happen if weight > 0 and within range
    return null;
  }

  /* ── Formatting helpers ───────────────────────────────────── */
  function fmt(n) {
    return "$" + n.toFixed(2);
  }

  function fmtDelta(n) {
    var sign = n >= 0 ? "+" : "-";
    return sign + "$" + Math.abs(n).toFixed(2);
  }

  /* ── DOM refs ─────────────────────────────────────────────── */
  var zipInput = document.getElementById("zip");
  var weightOzInput = document.getElementById("weight-oz");
  var weightLbInput = document.getElementById("weight-lb");
  var weightExtraOzInput = document.getElementById("weight-extra-oz");
  var packagingInput = document.getElementById("packaging");
  var pkgQuickaddContainer = document.getElementById("pkg-quickadd");
  var calcBtn = document.getElementById("calc-btn");
  var resultsCard = document.getElementById("results");
  var errorCard = document.getElementById("error-card");
  var errorMsg = document.getElementById("error-msg");
  var detailsSection = document.getElementById("details-section");
  var detailsBody = document.getElementById("details-body");
  var copyBtn = document.getElementById("copy-btn");
  var copyFeedback = document.getElementById("copy-feedback");

  var outUsps = document.getElementById("out-usps");
  var outPkg = document.getElementById("out-pkg");
  var outTotal = document.getElementById("out-total");
  var outSquare = document.getElementById("out-square");
  var outDelta = document.getElementById("out-delta");
  var deltaLabel = document.getElementById("delta-label");
  var deltaRow = document.getElementById("delta-row");

  var zipError = document.getElementById("zip-error");
  var weightError = document.getElementById("weight-error");
  var packagingError = document.getElementById("packaging-error");

  /* ── Last computed summary / result for copy & record ────── */
  var lastSummary = "";
  var lastCalcResult = null; // set by calculate(), used by record button

  /* ── Weight inputs (mutual exclusion: oz vs lb+oz) ────────── */
  // "oz" = total ounces field is active, "lboz" = lb+oz fields are active
  var activeWeightGroup = null; // set when user types

  function dimOzField() {
    weightOzInput.classList.add("dimmed");
  }
  function undimOzField() {
    weightOzInput.classList.remove("dimmed");
  }
  function dimLbozFields() {
    weightLbInput.classList.add("dimmed");
    weightExtraOzInput.classList.add("dimmed");
  }
  function undimLbozFields() {
    weightLbInput.classList.remove("dimmed");
    weightExtraOzInput.classList.remove("dimmed");
  }

  function activateOzGroup() {
    if (activeWeightGroup === "oz") return;
    activeWeightGroup = "oz";
    undimOzField();
    dimLbozFields();
    weightLbInput.value = "";
    weightExtraOzInput.value = "";
  }

  function activateLbozGroup() {
    if (activeWeightGroup === "lboz") return;
    activeWeightGroup = "lboz";
    undimLbozFields();
    dimOzField();
    weightOzInput.value = "";
  }

  function resetWeightGroups() {
    activeWeightGroup = null;
    undimOzField();
    undimLbozFields();
  }

  // When user types in oz field, clear and dim lb+oz fields
  weightOzInput.addEventListener("input", function () {
    if (weightOzInput.value.trim() !== "") {
      activateOzGroup();
    } else {
      resetWeightGroups();
    }
  });

  // When user types in either lb or extra-oz field, clear and dim oz field
  weightLbInput.addEventListener("input", function () {
    if (weightLbInput.value.trim() !== "" || weightExtraOzInput.value.trim() !== "") {
      activateLbozGroup();
    } else {
      resetWeightGroups();
    }
  });
  weightExtraOzInput.addEventListener("input", function () {
    if (weightLbInput.value.trim() !== "" || weightExtraOzInput.value.trim() !== "") {
      activateLbozGroup();
    } else {
      resetWeightGroups();
    }
  });

  // Read weight in ounces from whichever group is active
  function getWeightOz() {
    if (activeWeightGroup === "oz") {
      var v = weightOzInput.value.trim();
      if (v === "") return null;
      var n = parseFloat(v);
      if (isNaN(n) || n <= 0) return null;
      return n;
    } else if (activeWeightGroup === "lboz") {
      var lbVal = weightLbInput.value.trim();
      var ozVal = weightExtraOzInput.value.trim();
      if (lbVal === "" && ozVal === "") return null;
      var lb = lbVal === "" ? 0 : parseFloat(lbVal);
      var oz = ozVal === "" ? 0 : parseFloat(ozVal);
      if (isNaN(lb) || isNaN(oz)) return null;
      var total = lb * 16 + oz;
      if (total <= 0) return null;
      return total;
    }
    return null;
  }

  function hasWeightInput() {
    if (activeWeightGroup === "oz") {
      return weightOzInput.value.trim() !== "";
    } else if (activeWeightGroup === "lboz") {
      return weightLbInput.value.trim() !== "" || weightExtraOzInput.value.trim() !== "";
    }
    return false;
  }

  /* ── Packaging quick-add (localStorage) ──────────────────── */
  var PKG_STORAGE_KEY = "hhs_pkg_recent";

  function loadPkgRecent() {
    try {
      var raw = localStorage.getItem(PKG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  var pkgSaveTimer = null;

  function savePkgCost(cost) {
    // Round to 2 decimals for comparison
    cost = parseFloat(cost.toFixed(2));
    if (cost <= 0) return;
    // Delay saving so rapid re-calculations don't spam chips
    clearTimeout(pkgSaveTimer);
    pkgSaveTimer = setTimeout(function () {
      var recent = loadPkgRecent();
      // Remove duplicate if exists
      recent = recent.filter(function (v) { return v !== cost; });
      // Add to end (most recent)
      recent.push(cost);
      // Keep last 3
      if (recent.length > 3) recent = recent.slice(recent.length - 3);
      try { localStorage.setItem(PKG_STORAGE_KEY, JSON.stringify(recent)); } catch (e) {}
      renderPkgChips();
    }, 1500);
  }

  function renderPkgChips() {
    var recent = loadPkgRecent();
    pkgQuickaddContainer.innerHTML = "";
    recent.forEach(function (val) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pkg-chip";
      chip.textContent = "$" + val.toFixed(2);
      chip.addEventListener("click", function () {
        packagingInput.value = val.toFixed(2);
        validatePackaging();
        onInput();
      });
      pkgQuickaddContainer.appendChild(chip);
    });
  }

  // Render chips on load
  renderPkgChips();

  /* ── Validation ───────────────────────────────────────────── */
  function validateZip() {
    var v = zipInput.value.trim();
    if (v === "") {
      zipError.textContent = "";
      zipInput.classList.remove("invalid");
      return false;
    }
    if (!/^\d{5}$/.test(v)) {
      zipError.textContent = "Enter exactly 5 digits";
      zipInput.classList.add("invalid");
      return false;
    }
    zipError.textContent = "";
    zipInput.classList.remove("invalid");
    return true;
  }

  function validateWeight() {
    var totalOz = getWeightOz();

    if (!hasWeightInput()) {
      weightError.textContent = "";
      return false;
    }
    if (totalOz === null || totalOz <= 0) {
      weightError.textContent = "Weight must be greater than 0";
      return false;
    }
    if (totalOz > 160) {
      weightError.textContent = "Max 10 lbs (160 oz) for Ground Advantage";
      return false;
    }
    weightError.textContent = "";
    return true;
  }

  function validatePackaging() {
    var v = packagingInput.value.trim();
    if (v === "") {
      packagingError.textContent = "";
      packagingInput.classList.remove("invalid");
      return true; // empty = 0
    }
    var n = parseFloat(v);
    if (isNaN(n) || n < 0) {
      packagingError.textContent = "Must be 0 or more";
      packagingInput.classList.add("invalid");
      return false;
    }
    packagingError.textContent = "";
    packagingInput.classList.remove("invalid");
    return true;
  }

  function allValid() {
    var z = validateZip();
    var w = validateWeight();
    var p = validatePackaging();
    return z && w && p;
  }

  /* ── Main calculation ─────────────────────────────────────── */
  function calculate() {
    // Clear previous
    resultsCard.hidden = true;
    errorCard.hidden = true;
    detailsSection.hidden = true;
    lastSummary = "";
    copyFeedback.textContent = "";

    if (!allValid()) return;

    var zip5 = zipInput.value.trim();
    var packagingCost = parseFloat(packagingInput.value.trim()) || 0;
    var weightOz = getWeightOz();
    var weightLb = weightOz / 16;

    // Save packaging cost to recent list
    if (packagingCost > 0) {
      savePkgCost(packagingCost);
    }

    // Zone
    var zoneResult = lookupZone(zip5, weightOz);
    if (zoneResult.zone === null) {
      showError("No zone found for ZIP " + zip5 + ". Check the destination.");
      return;
    }
    var zone = zoneResult.zone;

    // Rate
    var rateResult = lookupRate(zone, weightOz);
    if (rateResult === null) {
      showError("Weight " + weightLb + " lb (" + weightOz.toFixed(1) + " oz) exceeds 10 lb limit for Ground Advantage.");
      return;
    }
    var uspsRate = rateResult.rate;

    // Square fee
    var squareResult = lookupSquareFee(weightLb);
    if (squareResult === null) {
      showError("Could not determine Square fee for weight " + weightLb + " lb.");
      return;
    }
    var squareFee = squareResult.fee;

    // Totals
    var estimatedTotal = uspsRate + packagingCost;
    var delta = squareFee - estimatedTotal;

    // Display results
    outUsps.textContent = fmt(uspsRate);
    outPkg.textContent = fmt(packagingCost);
    outTotal.textContent = fmt(estimatedTotal);
    outSquare.textContent = fmt(squareFee);
    outDelta.textContent = fmtDelta(delta);

    // Delta styling
    outDelta.classList.remove("positive", "negative");
    if (delta >= 0) {
      outDelta.classList.add("positive");
      deltaLabel.textContent = "You charge more";
    } else {
      outDelta.classList.add("negative");
      deltaLabel.textContent = "You charge less";
    }

    resultsCard.hidden = false;

    // Details
    var details = [];
    details.push(line("Destination ZIP", zip5));
    details.push(line("Destination ZIP3", zip5.substring(0, 3)));
    details.push(line("Zone", zone));
    if (zoneResult.exceptionNote) {
      details.push(line("Exception", zoneResult.exceptionNote));
    }
    details.push(line("Weight", weightOz.toFixed(1) + " oz (" + weightLb.toFixed(4) + " lb)"));
    details.push(line("Weight bracket", "Not over " + rateResult.bracketLabel));
    details.push(line("USPS rate", "Zone " + zone + " / bracket " + rateResult.bracketLabel + " = " + fmt(uspsRate)));
    details.push(line("Square tier", squareResult.label + " = " + fmt(squareFee)));
    details.push('<div class="note">Zone lookup uses the official USPS zone chart for origin ZIP3 prefix 132 (Syracuse, NY 13206). Rates are USPS Ground Advantage Retail. This is an estimate only.</div>');

    detailsBody.innerHTML = details.join("");
    detailsSection.hidden = false;

    // Build summary string for copy
    lastSummary = "ZIP " + zip5 +
      " | wt " + weightOz.toFixed(1) + " oz" +
      " | zone " + zone +
      " | USPS " + fmt(uspsRate) +
      " + pkg " + fmt(packagingCost) +
      " = " + fmt(estimatedTotal) +
      " | Square " + fmt(squareFee) +
      " | delta " + fmtDelta(delta);

    // Store for record button
    lastCalcResult = {
      zip: zip5,
      weightOz: weightOz,
      zone: zone,
      uspsRate: uspsRate,
      packagingCost: packagingCost,
      estimatedTotal: estimatedTotal,
      squareFee: squareFee,
      delta: delta
    };
  }

  function line(label, value) {
    return '<div class="detail-line"><strong>' + label + ':</strong> ' + value + '</div>';
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorCard.hidden = false;
    resultsCard.hidden = true;
    detailsSection.hidden = true;
  }

  /* ── Shipping log (localStorage) ──────────────────────────── */
  var LOG_STORAGE_KEY = "hhs_shipping_log";
  var logSection = document.getElementById("log-section");
  var logEntriesContainer = document.getElementById("log-entries");
  var logTotalsContainer = document.getElementById("log-totals");
  var recordBtn = document.getElementById("record-btn");
  var recordFeedback = document.getElementById("record-feedback");
  var csvBtn = document.getElementById("csv-btn");
  var csvFeedback = document.getElementById("csv-feedback");

  function loadLog() {
    try {
      var raw = localStorage.getItem(LOG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveLog(log) {
    try { localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(log)); } catch (e) {}
  }

  // Record current estimate
  recordBtn.addEventListener("click", function () {
    if (!lastCalcResult) return;
    var r = lastCalcResult;
    var entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      zip: r.zip,
      weightOz: r.weightOz,
      zone: r.zone,
      uspsRate: r.uspsRate,
      packagingCost: r.packagingCost,
      estimatedTotal: r.estimatedTotal,
      squareFee: r.squareFee,
      delta: r.delta,
      status: "pending",     // "pending" | "verified" | "edited"
      actualUsps: null,
      actualSquare: null
    };
    var log = loadLog();
    log.push(entry);
    saveLog(log);
    renderLog();
    recordFeedback.textContent = "Recorded!";
    setTimeout(function () { recordFeedback.textContent = ""; }, 2000);
  });

  function verifyEntry(id) {
    var log = loadLog();
    for (var i = 0; i < log.length; i++) {
      if (log[i].id === id) {
        log[i].status = "verified";
        log[i].actualUsps = log[i].estimatedTotal;
        log[i].actualSquare = log[i].squareFee;
        break;
      }
    }
    saveLog(log);
    renderLog();
  }

  function deleteEntry(id) {
    var log = loadLog();
    log = log.filter(function (e) { return e.id !== id; });
    saveLog(log);
    renderLog();
  }

  function saveEditedEntry(id, actualUsps, actualSquare) {
    var log = loadLog();
    for (var i = 0; i < log.length; i++) {
      if (log[i].id === id) {
        log[i].status = "edited";
        log[i].actualUsps = actualUsps;
        log[i].actualSquare = actualSquare;
        break;
      }
    }
    saveLog(log);
    renderLog();
  }

  var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatDate(iso) {
    var d = new Date(iso);
    var mon = MONTH_NAMES[d.getMonth()];
    var day = d.getDate();
    var hr = d.getHours();
    var min = d.getMinutes();
    var ampm = hr >= 12 ? "pm" : "am";
    hr = hr % 12 || 12;
    return mon + " " + day + ", " + hr + ":" + (min < 10 ? "0" : "") + min + ampm;
  }

  function renderLog() {
    var log = loadLog();
    logEntriesContainer.innerHTML = "";
    logTotalsContainer.innerHTML = "";

    if (log.length === 0) {
      logSection.hidden = true;
      return;
    }

    logSection.hidden = false;

    // Render entries newest first
    for (var i = log.length - 1; i >= 0; i--) {
      renderLogEntry(log[i]);
    }

    // Compute and render totals
    renderTotals(log);
  }

  function renderLogEntry(entry) {
    var isResolved = entry.status === "verified" || entry.status === "edited";
    var div = document.createElement("div");
    div.className = "log-entry" + (entry.status !== "pending" ? " " + entry.status : "") +
                    (isResolved ? " collapsed" : "");
    div.setAttribute("data-id", entry.id);

    var statusLabel = entry.status === "verified" ? "Verified" :
                      entry.status === "edited" ? "Updated" : "Pending";

    // For resolved entries, show the actual difference in the header
    var headerDiff = entry.delta;
    if (entry.status === "edited") {
      headerDiff = entry.actualSquare - entry.actualUsps;
    } else if (entry.status === "verified") {
      headerDiff = entry.squareFee - entry.estimatedTotal;
    }
    var diffClass = headerDiff >= 0 ? "positive" : "negative";

    var html = '<div class="log-entry-header">' +
      '<span class="log-date">' + formatDate(entry.date) + '</span>' +
      '<div class="log-header-right">' +
        (isResolved ? '<span class="log-header-diff ' + diffClass + '">' + fmtDelta(headerDiff) + '</span>' : '') +
        '<span class="log-status ' + entry.status + '">' + statusLabel + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="log-body">' +
    '<div class="log-details">' +
      '<div class="log-row"><span>ZIP</span> ' + entry.zip + '</div>' +
      '<div class="log-row"><span>Weight</span> ' + entry.weightOz.toFixed(1) + ' oz</div>' +
      '<div class="log-row"><span>Zone</span> ' + entry.zone + '</div>' +
      '<div class="log-row"><span>Est. USPS+Pkg</span> ' + fmt(entry.estimatedTotal) + '</div>' +
      '<div class="log-row"><span>Square charged</span> ' + fmt(entry.squareFee) + '</div>' +
      '<div class="log-row"><span>Difference</span> <span class="' + (entry.delta >= 0 ? "positive" : "negative") + '">' + fmtDelta(entry.delta) + '</span></div>';

    if (entry.status === "edited") {
      var actualDelta = entry.actualSquare - entry.actualUsps;
      html += '<div class="log-actual-line">Actual: USPS+Pkg ' + fmt(entry.actualUsps) +
        ' / Charged ' + fmt(entry.actualSquare) +
        ' / Diff ' + fmtDelta(actualDelta) + '</div>';
    }

    html += '</div>';

    if (entry.status === "pending") {
      html += '<div class="log-actions">' +
        '<button type="button" class="btn-verify" data-action="verify">Verify</button>' +
        '<button type="button" class="btn-edit" data-action="edit">Edit</button>' +
        '<button type="button" class="btn-delete" data-action="delete">Del</button>' +
      '</div>';
    } else {
      html += '<div class="log-actions">' +
        '<button type="button" class="btn-edit" data-action="edit">Edit</button>' +
        '<button type="button" class="btn-delete" data-action="delete">Del</button>' +
      '</div>';
    }

    html += '</div>'; // close .log-body

    div.innerHTML = html;

    // Toggle collapse on click for resolved entries
    if (isResolved) {
      div.addEventListener("click", function (e) {
        // Don't toggle if clicking a button or input inside the body
        if (e.target.closest("button") || e.target.closest("input")) return;
        div.classList.toggle("collapsed");
      });
    }

    // Wire up action buttons
    var buttons = div.querySelectorAll("[data-action]");
    for (var b = 0; b < buttons.length; b++) {
      (function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var action = btn.getAttribute("data-action");
          if (action === "verify") {
            verifyEntry(entry.id);
          } else if (action === "delete") {
            deleteEntry(entry.id);
          } else if (action === "edit") {
            showEditForm(div, entry);
          }
        });
      })(buttons[b]);
    }

    logEntriesContainer.appendChild(div);
  }

  function showEditForm(entryDiv, entry) {
    // Don't add form twice
    if (entryDiv.querySelector(".log-edit-form")) return;

    // Hide actions
    var actionsDiv = entryDiv.querySelector(".log-actions");
    if (actionsDiv) actionsDiv.hidden = true;

    var prefillUsps = entry.actualUsps !== null ? entry.actualUsps : entry.estimatedTotal;
    var prefillSquare = entry.actualSquare !== null ? entry.actualSquare : entry.squareFee;

    var form = document.createElement("div");
    form.className = "log-edit-form";
    form.innerHTML =
      '<div class="log-edit-row">' +
        '<label>Actual USPS+Pkg</label>' +
        '<input type="number" inputmode="decimal" step="0.01" min="0" value="' + prefillUsps.toFixed(2) + '" data-field="usps">' +
      '</div>' +
      '<div class="log-edit-row">' +
        '<label>Actual Charged</label>' +
        '<input type="number" inputmode="decimal" step="0.01" min="0" value="' + prefillSquare.toFixed(2) + '" data-field="square">' +
      '</div>' +
      '<div class="log-edit-actions">' +
        '<button type="button" class="btn-save">Save</button>' +
        '<button type="button" class="btn-cancel">Cancel</button>' +
      '</div>';

    // Stop clicks inside form from toggling collapse
    form.addEventListener("click", function (e) { e.stopPropagation(); });

    form.querySelector(".btn-save").addEventListener("click", function () {
      var uspsVal = parseFloat(form.querySelector('[data-field="usps"]').value);
      var sqVal = parseFloat(form.querySelector('[data-field="square"]').value);
      if (isNaN(uspsVal) || uspsVal < 0) uspsVal = entry.estimatedTotal;
      if (isNaN(sqVal) || sqVal < 0) sqVal = entry.squareFee;
      saveEditedEntry(entry.id, uspsVal, sqVal);
    });

    form.querySelector(".btn-cancel").addEventListener("click", function () {
      form.remove();
      if (actionsDiv) actionsDiv.hidden = false;
    });

    entryDiv.appendChild(form);
  }

  function renderTotals(log) {
    var estCostTotal = 0;
    var estChargedTotal = 0;
    var estCount = log.length;

    var actCostTotal = 0;
    var actChargedTotal = 0;
    var actCount = 0;

    for (var i = 0; i < log.length; i++) {
      var e = log[i];
      estCostTotal += e.estimatedTotal;
      estChargedTotal += e.squareFee;

      if (e.status === "verified" || e.status === "edited") {
        actCostTotal += e.actualUsps;
        actChargedTotal += e.actualSquare;
        actCount++;
      }
    }

    var estNet = estChargedTotal - estCostTotal;
    var actNet = actChargedTotal - actCostTotal;

    var html = '<div class="log-totals-heading">All Estimates (' + estCount + ' shipments)</div>' +
      totalRow("Total cost (USPS+pkg)", fmt(estCostTotal)) +
      totalRow("Total charged (Square)", fmt(estChargedTotal)) +
      totalRow("Net", fmtDelta(estNet), estNet >= 0 ? "positive" : "negative");

    if (actCount > 0) {
      html += '<div class="log-totals-heading">Verified / Updated (' + actCount + ' shipments)</div>' +
        totalRow("Total actual cost", fmt(actCostTotal)) +
        totalRow("Total actual charged", fmt(actChargedTotal)) +
        totalRow("Net", fmtDelta(actNet), actNet >= 0 ? "positive" : "negative");
    }

    logTotalsContainer.innerHTML = html;
  }

  function totalRow(label, value, cls) {
    return '<div class="log-total-row"><span class="label">' + label +
      '</span><span class="value' + (cls ? " " + cls : "") + '">' + value + '</span></div>';
  }

  // CSV export
  csvBtn.addEventListener("click", function () {
    var log = loadLog();
    if (log.length === 0) return;

    var rows = [];
    rows.push("Date,ZIP,Weight (oz),Zone,Est USPS+Pkg,Square Charged,Delta,Status,Actual Cost,Actual Charged");

    for (var i = 0; i < log.length; i++) {
      var e = log[i];
      var d = new Date(e.date);
      var dateStr = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() +
        " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      rows.push(
        dateStr + "," +
        e.zip + "," +
        e.weightOz.toFixed(1) + "," +
        e.zone + "," +
        e.estimatedTotal.toFixed(2) + "," +
        e.squareFee.toFixed(2) + "," +
        e.delta.toFixed(2) + "," +
        e.status + "," +
        (e.actualUsps !== null ? e.actualUsps.toFixed(2) : "") + "," +
        (e.actualSquare !== null ? e.actualSquare.toFixed(2) : "")
      );
    }

    var csvText = rows.join("\n");
    copyText(csvText, csvFeedback);
  });

  function copyText(text, feedbackEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        feedbackEl.textContent = "Copied!";
        setTimeout(function () { feedbackEl.textContent = ""; }, 2000);
      }, function () {
        fallbackCopyText(text, feedbackEl);
      });
    } else {
      fallbackCopyText(text, feedbackEl);
    }
  }

  function fallbackCopyText(text, feedbackEl) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      feedbackEl.textContent = "Copied!";
    } catch (e) {
      feedbackEl.textContent = "Copy failed";
    }
    document.body.removeChild(ta);
    setTimeout(function () { feedbackEl.textContent = ""; }, 2000);
  }

  // Render log on load
  renderLog();

  /* ── Copy summary ─────────────────────────────────────────── */
  copyBtn.addEventListener("click", function () {
    if (!lastSummary) return;
    copyText(lastSummary, copyFeedback);
  });

  /* ── Event wiring ─────────────────────────────────────────── */
  calcBtn.addEventListener("click", calculate);

  // Debounced auto-calculate on input
  var debounceTimer = null;
  function onInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      // Only auto-calc if all fields have values and are valid
      if (zipInput.value.trim().length === 5 &&
          hasWeightInput() &&
          allValid()) {
        calculate();
      }
    }, 250);
  }

  function onWeightInput() {
    validateWeight();
    onInput();
  }

  zipInput.addEventListener("input", function () {
    validateZip();
    onInput();
  });
  weightOzInput.addEventListener("input", onWeightInput);
  weightLbInput.addEventListener("input", onWeightInput);
  weightExtraOzInput.addEventListener("input", onWeightInput);
  packagingInput.addEventListener("input", function () {
    validatePackaging();
    onInput();
  });

  // Submit on Enter key from any input
  [zipInput, weightOzInput, weightLbInput, weightExtraOzInput, packagingInput].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        calculate();
      }
    });
  });
})();
