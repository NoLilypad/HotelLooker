function extractTripadvisorHotelKey(url) {
  if (!url || url.trim() === "") {
    return { success: false};
  }

  const re1 = /Hotel_Review-/g;
  const re2 = /-Reviews/g;

  const match1 = re1.exec(url);
  const match2 = re2.exec(url);

  if (!match1 || !match2) {
    return {
      success: false
    };
  }

  const hotelKey = url.substring(match1.index + 13, match2.index);

  return {
    success: true,
    hotelKey: hotelKey
  };
}

console.log(extractTripadvisorHotelKey("https://www.tripadvisor.fr/Hotel_Review-g187147-d233386-Reviews-Apollo_Opera_Paris-Paris_Ile_de_France.html"));
