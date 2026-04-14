import { useEffect, useRef, useState } from "react";
import { FaInfoCircle, FaTh } from "react-icons/fa";

const randomFirstNames = ["Ava", "Mason", "Mia", "Ethan", "Liam", "Nora"];
const randomMiddleNames = ["Ray", "Lee", "James", "Mae", "Ann", "Kai"];
const randomLastNames = [
  "Carter",
  "Brooks",
  "Reed",
  "Hayes",
  "Walker",
  "Grant",
];

const sexOptions = [
  { label: "Select", value: "" },
  { label: "M", value: "M" },
  { label: "F", value: "F" },
  { label: "X", value: "X" },
];

const donorOptions = [
  { label: "Select", value: "" },
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
];

const eyeOptions = [
  { label: "BLK (Black)", value: "BLK" },
  { label: "BLU (Blue)", value: "BLU" },
  { label: "BRO (Brown)", value: "BRO" },
  { label: "GRN (Green)", value: "GRN" },
  { label: "GRY (Gray)", value: "GRY" },
  { label: "HAZ (Hazel)", value: "HAZ" },
];

const hairOptions = [
  { label: "BAL (Bald)", value: "BAL" },
  { label: "BLK (Black)", value: "BLK" },
  { label: "BLN (Blond)", value: "BLN" },
  { label: "BRO (Brown)", value: "BRO" },
  { label: "GRY (Gray)", value: "GRY" },
  { label: "RED (Red)", value: "RED" },
  { label: "WHI (White)", value: "WHI" },
];
const raceOptions = [
  "-- Select --",
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic",
  "Native Hawaiian or Pacific Islander",
  "White",
  "Other",
];
const suffixOptions = ["NONE", "JR", "SR", "II", "III", "IV"];

const initialForm = {
  dlNumber: "",
  firstName: "",
  lastName: "",
  middleName: "",
  address: "",
  city: "",
  zipCode: "",
  dlClass: "",
  sex: "",
  donor: "",
  birthDate: "",
  issueDate: "",
  expiryDate: "",
  dd: "",
  icn: "",
  restrictions: "NONE",
  endorsement: "NONE",
  heightIn: "64",
  weightLb: "167",
  eye: "",
  hair: "",
  race: "-- Select --",
  nameSuffix: "NONE",
};

const generateDigits = (length) => {
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += Math.floor(Math.random() * 10).toString();
  }

  return value;
};

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const sanitizeDigits = (value, maxLength) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const toMmddyyyy = (date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  return `${month}${day}${year}`;
};

const parseMmddyyyy = (value) => {
  if (!/^\d{8}$/.test(value)) {
    return null;
  }

  const month = Number.parseInt(value.slice(0, 2), 10);
  const day = Number.parseInt(value.slice(2, 4), 10);
  const year = Number.parseInt(value.slice(4, 8), 10);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const randomDateBetween = (startDate, endDate) => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (endTime <= startTime) {
    return new Date(startTime);
  }

  const randomTime =
    startTime + Math.floor(Math.random() * (endTime - startTime + 1));

  return new Date(randomTime);
};

const generateIssueDate = () => {
  const minDate = new Date(2024, 0, 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() - 2);

  return toMmddyyyy(randomDateBetween(minDate, maxDate));
};

const generateBirthDate = () => {
  const minDate = new Date(1950, 0, 1);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  return toMmddyyyy(randomDateBetween(minDate, maxDate));
};

const isValidIssueDate = (value) => {
  const parsed = parseMmddyyyy(value);
  if (!parsed) {
    return false;
  }

  const minDate = new Date(2024, 0, 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() - 2);

  return parsed >= minDate && parsed <= maxDate;
};

const generateExpiryDateFromIssue = (issueDateValue) => {
  const issueDate = parseMmddyyyy(issueDateValue);
  const sourceIssueDate = issueDate ?? parseMmddyyyy(generateIssueDate());

  if (!sourceIssueDate) {
    return "";
  }

  const expiryYear = sourceIssueDate.getFullYear() + 5;
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(expiryYear, randomMonth, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  const month = `${randomMonth}`.padStart(2, "0");
  const day = `${randomDay}`.padStart(2, "0");

  return `${month}${day}${expiryYear}`;
};

const trimCanvas = (sourceCanvas) => {
  const context = sourceCanvas.getContext("2d");

  if (!context) {
    return sourceCanvas;
  }

  const { width, height } = sourceCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let foundPixel = false;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = pixels[index + 3];

      if (alpha > 0) {
        foundPixel = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!foundPixel) {
    return sourceCanvas;
  }

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;
  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = trimmedWidth;
  targetCanvas.height = trimmedHeight;

  const targetContext = targetCanvas.getContext("2d");
  if (!targetContext) {
    return sourceCanvas;
  }

  targetContext.putImageData(
    context.getImageData(minX, minY, trimmedWidth, trimmedHeight),
    0,
    0,
  );

  return targetCanvas;
};

const formatEquivalent = (value, factor, unit) => {
  const numericValue = Number.parseFloat(value);

  if (Number.isNaN(numericValue)) {
    return `-- ${unit}`;
  }

  return `${(numericValue * factor).toFixed(1)} ${unit}`;
};

const FieldLabel = ({
  children,
  showInfo = false,
  showGenerator = false,
  onGenerate,
  generatorLabel,
}) => (
  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
    <div className="flex items-center gap-1.5">
      <span>{children}</span>
      {showInfo ? (
        <FaInfoCircle className="text-sky-500" aria-hidden="true" />
      ) : null}
    </div>
    {showGenerator ? (
      <button
        type="button"
        onClick={onGenerate}
        aria-label={generatorLabel}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-sky-300 hover:text-sky-600"
      >
        <FaTh aria-hidden="true" />
      </button>
    ) : null}
  </div>
);

const TextField = ({
  label,
  value,
  onChange,
  showInfo = false,
  showGenerator = false,
  onGenerate,
  generatorLabel,
  placeholder = "",
  maxLength,
}) => (
  <label className="block">
    <FieldLabel
      showInfo={showInfo}
      showGenerator={showGenerator}
      onGenerate={onGenerate}
      generatorLabel={generatorLabel}
    >
      {label}
    </FieldLabel>
    <input
      type="text"
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  showInfo = false,
  showGenerator = false,
  onGenerate,
  generatorLabel,
}) => (
  <label className="block">
    <FieldLabel
      showInfo={showInfo}
      showGenerator={showGenerator}
      onGenerate={onGenerate}
      generatorLabel={generatorLabel}
    >
      {label}
    </FieldLabel>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  </label>
);

const DateField = ({
  label,
  value,
  onChange,
  placeholder,
  showGenerator = false,
  onGenerate,
  generatorLabel,
}) => (
  <label className="block">
    <FieldLabel
      showInfo
      showGenerator={showGenerator}
      onGenerate={onGenerate}
      generatorLabel={generatorLabel}
    >
      {label}
    </FieldLabel>
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={onChange}
      maxLength={8}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    />
  </label>
);

const BarCode = () => {
  const [form, setForm] = useState(initialForm);
  const [barcodeSvg, setBarcodeSvg] = useState("");
  const [pngDataUrl, setPngDataUrl] = useState("");
  const [svgDownloadUrl, setSvgDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const svgUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (svgUrlRef.current) {
        URL.revokeObjectURL(svgUrlRef.current);
      }
    };
  }, []);

  const updateField = (field) => (event) => {
    const rawValue = event.target.value;

    const numericFieldLimits = {
      dlNumber: 8,
      zipCode: 9,
      birthDate: 8,
      issueDate: 8,
      expiryDate: 8,
      dd: 20,
      icn: 11,
      heightIn: 3,
      weightLb: 3,
    };

    const maxLength = numericFieldLimits[field];
    const value = maxLength ? sanitizeDigits(rawValue, maxLength) : rawValue;

    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const adjustNumericField = (field, delta) => {
    setForm((currentForm) => {
      const currentValue = Number.parseInt(currentForm[field] || "0", 10);
      const safeValue = Number.isNaN(currentValue) ? 0 : currentValue;

      return {
        ...currentForm,
        [field]: `${Math.max(1, safeValue + delta)}`,
      };
    });
  };

  const generateValueForField = (field) => {
    const fieldValueGenerators = {
      dlNumber: () =>
        `${Math.floor(Math.random() * 9) + 1}${generateDigits(7)}`,
      firstName: () => pickRandom(randomFirstNames),
      middleName: () => pickRandom(randomMiddleNames),
      lastName: () => pickRandom(randomLastNames),
      zipCode: () => generateDigits(9),
      dd: () => `00629480035200${generateDigits(6)}`,
      icn: () => `10000${generateDigits(6)}`,
    };

    const generator = fieldValueGenerators[field];

    if (!generator) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      [field]: generator(),
    }));
  };

  const generateBirthDateForField = () => {
    setForm((currentForm) => ({
      ...currentForm,
      birthDate: generateBirthDate(),
    }));
  };

  const generateIssueDateForField = () => {
    setForm((currentForm) => ({
      ...currentForm,
      issueDate: generateIssueDate(),
    }));
  };

  const generateExpiryDateForField = () => {
    setForm((currentForm) => {
      const nextIssueDate = isValidIssueDate(currentForm.issueDate)
        ? currentForm.issueDate
        : generateIssueDate();

      return {
        ...currentForm,
        issueDate: nextIssueDate,
        expiryDate: generateExpiryDateFromIssue(nextIssueDate),
      };
    });
  };

  const buildBarcodePayload = (data = form) => {
    const lines = [
      `DL Number: ${data.dlNumber}`,
      `First Name: ${data.firstName}`,
      `Middle Name: ${data.middleName}`,
      `Last Name: ${data.lastName}`,
      `Address: ${data.address}`,
      `City: ${data.city}`,
      `Zip Code: ${data.zipCode}`,
      `DL Class: ${data.dlClass}`,
      `Sex: ${data.sex}`,
      `Donor: ${data.donor}`,
      `Birth Date: ${data.birthDate}`,
      `Issue Date: ${data.issueDate}`,
      `Expiry Date: ${data.expiryDate}`,
      `DD: ${data.dd}`,
      `ICN: ${data.icn}`,
      `Restrictions: ${data.restrictions}`,
      `Endorsement: ${data.endorsement}`,
      `Height (in.): ${data.heightIn}`,
      `Weight (lb.): ${data.weightLb}`,
      `Eye: ${data.eye}`,
      `Hair: ${data.hair}`,
      `Race: ${data.race}`,
      `Name Suffix: ${data.nameSuffix}`,
    ];

    return lines.join("\n");
  };

  const handleCreate = async () => {
    try {
      setError("");

      const { default: bwipjs } = await import("bwip-js");

      const nextIssueDate = isValidIssueDate(form.issueDate)
        ? form.issueDate
        : generateIssueDate();
      const nextExpiryDate = generateExpiryDateFromIssue(nextIssueDate);

      setForm((currentForm) => ({
        ...currentForm,
        issueDate: nextIssueDate,
        expiryDate: nextExpiryDate,
      }));

      const payload = buildBarcodePayload({
        ...form,
        issueDate: nextIssueDate,
        expiryDate: nextExpiryDate,
      });
      const options = {
        bcid: "pdf417",
        text: payload,
        scale: 3,
        height: 33,
        paddingwidth: 1,
        paddingheight: 1,
        backgroundcolor: "FFFFFF",
      };

      const svgMarkup = bwipjs.toSVG(options);
      const canvas = document.createElement("canvas");

      bwipjs.toCanvas(canvas, options);
      const trimmedCanvas = trimCanvas(canvas);

      if (svgUrlRef.current) {
        URL.revokeObjectURL(svgUrlRef.current);
      }

      const svgBlob = new Blob([svgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const nextSvgUrl = URL.createObjectURL(svgBlob);

      svgUrlRef.current = nextSvgUrl;
      setBarcodeSvg(svgMarkup);
      setSvgDownloadUrl(nextSvgUrl);
      setPngDataUrl(trimmedCanvas.toDataURL("image/png"));
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create barcode.",
      );
      setBarcodeSvg("");
      setSvgDownloadUrl("");
      setPngDataUrl("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200 md:p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            DMV Entry
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Driver License PDF417 Builder
          </h1>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              label="DL Number"
              value={form.dlNumber}
              onChange={updateField("dlNumber")}
              placeholder="96420133"
              maxLength={8}
              showInfo
              showGenerator
              generatorLabel="Generate random DL Number"
              onGenerate={() => generateValueForField("dlNumber")}
            />
            <TextField
              label="First name"
              value={form.firstName}
              onChange={updateField("firstName")}
              placeholder="John"
              showGenerator
              generatorLabel="Generate random First name"
              onGenerate={() => generateValueForField("firstName")}
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={updateField("lastName")}
              placeholder="Doe"
              showGenerator
              generatorLabel="Generate random Last name"
              onGenerate={() => generateValueForField("lastName")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              label="Middle name"
              value={form.middleName}
              onChange={updateField("middleName")}
              placeholder="Grace"
              showInfo
              showGenerator
              generatorLabel="Generate random Middle name"
              onGenerate={() => generateValueForField("middleName")}
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={updateField("address")}
              placeholder="709 E Clare St"
            />
            <TextField
              label="City"
              value={form.city}
              onChange={updateField("city")}
              placeholder="Rutherford"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <TextField
              label="Zip code"
              value={form.zipCode}
              onChange={updateField("zipCode")}
              placeholder="754901234"
              maxLength={9}
              showGenerator
              generatorLabel="Generate random ZIP code"
              onGenerate={() => generateValueForField("zipCode")}
            />
            <TextField
              label="DL Class"
              value={form.dlClass}
              onChange={updateField("dlClass")}
              placeholder="C"
            />
            <SelectField
              label="Sex"
              value={form.sex}
              onChange={updateField("sex")}
              options={sexOptions}
            />
            <SelectField
              label="Donor"
              value={form.donor}
              onChange={updateField("donor")}
              options={donorOptions}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DateField
              label="Birth date"
              value={form.birthDate}
              onChange={updateField("birthDate")}
              placeholder="07112001"
              showGenerator
              generatorLabel=""
              onGenerate={generateBirthDateForField}
            />
            <DateField
              label="Issue date"
              value={form.issueDate}
              onChange={updateField("issueDate")}
              placeholder="04242025"
              showGenerator
              generatorLabel="Generate random Issue date"
              onGenerate={generateIssueDateForField}
            />
            <DateField
              label="Expiry date"
              value={form.expiryDate}
              onChange={updateField("expiryDate")}
              placeholder="05152030"
              showGenerator
              generatorLabel="Generate random Expiry date"
              onGenerate={generateExpiryDateForField}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="DD"
              value={form.dd}
              onChange={updateField("dd")}
              placeholder="00629480035200145896"
              maxLength={20}
              showInfo
              showGenerator
              generatorLabel="Generate random DD"
              onGenerate={() => generateValueForField("dd")}
            />
            <TextField
              label="ICN"
              value={form.icn}
              onChange={updateField("icn")}
              placeholder="10000894214"
              maxLength={11}
              showInfo
              showGenerator
              generatorLabel="Generate random ICN"
              onGenerate={() => generateValueForField("icn")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <TextField
              label="Restrictions"
              value={form.restrictions}
              onChange={updateField("restrictions")}
              placeholder="Restrictions"
            />
            <TextField
              label="Endorsement"
              value={form.endorsement}
              onChange={updateField("endorsement")}
              placeholder="Endorsement"
            />
            <div className="block">
              <FieldLabel>Height (in.)</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.heightIn}
                    onChange={updateField("heightIn")}
                    placeholder="Height in inches"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => adjustNumericField("heightIn", 1)}
                      className="h-4 w-5 text-[10px] leading-none text-slate-700 hover:bg-slate-100"
                      aria-label="Increase height"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustNumericField("heightIn", -1)}
                      className="h-4 w-5 border-t border-slate-300 text-[10px] leading-none text-slate-700 hover:bg-slate-100"
                      aria-label="Decrease height"
                    >
                      -
                    </button>
                  </div>
                </div>
                <span className="min-w-20 text-sm font-medium text-slate-500">
                  {formatEquivalent(form.heightIn, 2.54, "cm")}
                </span>
              </div>
            </div>
            <div className="block">
              <FieldLabel>Weight (lb.)</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.weightLb}
                    onChange={updateField("weightLb")}
                    placeholder="Weight in pounds"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => adjustNumericField("weightLb", 1)}
                      className="h-4 w-5 text-[10px] leading-none text-slate-700 hover:bg-slate-100"
                      aria-label="Increase weight"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustNumericField("weightLb", -1)}
                      className="h-4 w-5 border-t border-slate-300 text-[10px] leading-none text-slate-700 hover:bg-slate-100"
                      aria-label="Decrease weight"
                    >
                      -
                    </button>
                  </div>
                </div>
                <span className="min-w-20 text-sm font-medium text-slate-500">
                  {formatEquivalent(form.weightLb, 0.453592, "kg")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <SelectField
              label="Eye (ANSI D-20)"
              value={form.eye}
              onChange={updateField("eye")}
              options={eyeOptions}
            />
            <SelectField
              label="Hair (ANSI D-20)"
              value={form.hair}
              onChange={updateField("hair")}
              options={hairOptions}
            />
            <SelectField
              label="Race (ANSI D-20)"
              value={form.race}
              onChange={updateField("race")}
              options={raceOptions}
            />
            <SelectField
              label="Name Suffix"
              value={form.nameSuffix}
              onChange={updateField("nameSuffix")}
              options={suffixOptions}
            />
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {barcodeSvg ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 overflow-x-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex justify-center">
                    <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:w-48">
                  <a
                    href={pngDataUrl}
                    download="driver-license-pdf417.png"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Download PNG
                  </a>
                  <a
                    href={svgDownloadUrl}
                    download="driver-license-pdf417.svg"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Download SVG
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BarCode;
