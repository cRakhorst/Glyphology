document.addEventListener("DOMContentLoaded", function () {
  let slides = {
    1: { type: "text", value: "gefeliciteerd! Ja ook op deze manier feliciteer ik je >:3" },
    2: { type: "text", value: "Ik heb een kleine verrassing voor je gemaakt" },
    3: { type: "text", value: "Ik heb hulp gekregen van veel vrienden om dit te maken" },
    4: { type: "text", value: "Eerst mensen die je kent" },
    5: { type: "text", value: "Without further ado, lets get into it!" },
    6: { type: "image", value: "assets/pictures/nick-1.png" },
    7: { type: "image", value: "assets/pictures/nick-2.png" },
    8: { type: "text", value: "Nick was misschien niet het slimste om te vragen, maar ik vond het wel grappig" },
    9: { type: "text", value: "We gaan al wel over naar mensen die jij niet kent, maar die wel heel aardig waren om mee te helpen" },
    10: { type: "image", value: "assets/pictures/muti.png" },
    11: { type: "image", value: "assets/pictures/quinten.jpeg" },
    12: { type: "image", value: "assets/pictures/leonie.png" },
    13: { type: "image", value: "assets/pictures/jefferey.png" },
    14: { type: "image", value: "assets/pictures/julian.png" },
    15: { type: "image", value: "assets/pictures/mirthe.png" },
    16: { type: "image", value: "assets/pictures/mixela.png" },
    17: { type: "image", value: "assets/pictures/juultje.png" },
    18: { type: "image", value: "assets/pictures/dardy.png" },
    19: { type: "text", value: "Nu gaan we iets verder weg, naar duitsland om precies te zijn" },
    20: { type: "image", value: "assets/pictures/xyrox.png" },
    21: { type: "text", value: "We gaan nog verder, helemaal naar zweden!" },
    22: { type: "image", value: "assets/pictures/linea.png" },
    23: { type: "text", value: "Ik hoop dat je het leuk vond, ik vond het in ieder geval heel leuk om te maken :3" },
    24: { type: "text", value: "Je bent een hele lieve vriendin en ik hoop dat we nog heel veel leuke dingen samen gaan doen!" },
    25: { type: "text", value: "Liefs, Chris" },
    26: { type: "text", value: "P.S. Ik heb nog een verrassing voor je, kijk achter je" },
    27: { type: "text", value: "ik snap niet waarom je denk dat er iets is" },
    28: { type: "text", value: "grapje er is wel meer :3" },
    29: { type: "text", value: "you're short HEHEHEHEHEHE >:3" },
    30: { type: "text", value: "mijn autisme wou dat er 30 slides waren, dus dit is de laatse. BYEE" },
  };

  const picture = document.getElementById("image");
  const text = document.getElementById("text");
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  let currentIndex = 1;
  const totalSlides = Object.keys(slides).length;

  function showSlide(index) {
    let slide = slides[index];

    if (slide.type === "image") {
      picture.src = slide.value;
      picture.style.display = "block";
      text.innerHTML = slide.text || "";
      text.style.display = slide.text ? "block" : "none";
    } else if (slide.type === "text") {
      picture.style.display = "none";
      text.innerHTML = slide.value;
      text.style.display = "block";
    }
  }

  showSlide(currentIndex);

  left.addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    if (currentIndex === 0) currentIndex = totalSlides;
    showSlide(currentIndex);
  });

  right.addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % totalSlides;
    if (currentIndex === 0) currentIndex = totalSlides;
    showSlide(currentIndex);
  });
});
