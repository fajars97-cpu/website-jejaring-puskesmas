const illustrationBase = import.meta.env.BASE_URL + "illustrations/facilities/";

const facilityIllustrations = {
  hospital: "hospital.jpg",
  generalClinic: "general-clinic.jpg",
  dentalClinic: "dental-clinic.jpg",
  circumcisionClinic: "circumcision-clinic.jpg",
  generalPractice: "general-practice.jpg",
  dentalPractice: "dental-practice.jpg",
  midwifePractice: "midwife-practice.jpg",
  puskesmasJagakarsa: "puskesmas-jagakarsa.jpg",
};

function normalize(value) {
  return String(value || "").toLocaleLowerCase("id-ID");
}

export function getFacilityIllustration({ namaFasyankes, jenisFasyankes, tipeFasyankes } = {}) {
  const name = normalize(namaFasyankes);
  const category = `${normalize(jenisFasyankes)} ${normalize(tipeFasyankes)}`;

  if (name === "jagakarsa" || name.includes("puskesmas jagakarsa")) {
    return illustrationBase + facilityIllustrations.puskesmasJagakarsa;
  }
  if (category.includes("rumah sakit")) return illustrationBase + facilityIllustrations.hospital;
  if (category.includes("khitan")) return illustrationBase + facilityIllustrations.circumcisionClinic;
  if (category.includes("bidan")) return illustrationBase + facilityIllustrations.midwifePractice;
  if (category.includes("dokter gigi") || category.includes("tpm gigi")) {
    return illustrationBase + facilityIllustrations.dentalPractice;
  }
  if (category.includes("dokter umum") || category.includes("tpm umum")) {
    return illustrationBase + facilityIllustrations.generalPractice;
  }
  if (category.includes("gigi") || category.includes("dental")) {
    return illustrationBase + facilityIllustrations.dentalClinic;
  }

  return illustrationBase + facilityIllustrations.generalClinic;
}

export function resolveFacilityImage(facility) {
  return facility?.foto || getFacilityIllustration(facility);
}
