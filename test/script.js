// script.js — optimized for smoothness and two-side UI

/* ========= QUESTIONS ARRAY =========
   Paste your 200 questions here (the same list you provided).
   For brevity I'm re-using the exact array you gave earlier.
*/
const questions = [
`Would you rather have the power to fly or turn invisible?`,
`Would you rather accidentally call your teacher “mom” or trip in front of the whole class?`,
`Would you rather always win rock-paper-scissors or always win coin flips?`,
`Would you rather read minds or control time?`,
`Would you rather eat only pizza forever or only ice cream forever?`,
`Would you rather be super strong but slow, or super fast but weak?`,
`Would you rather laugh so hard you snort in front of your crush or hiccup while giving a speech?`,
`Would you rather teleport anywhere or have unlimited money for food?`,
`Would you rather live with no internet or no AC in the summer?`,
`Would you rather burp loudly in class or fart silently but smelly during exams?`,
`Would you rather have super speed or super intelligence?`,
`Would you rather forget your homework or forget your backpack at home?`,
`Would you rather always have bad hair or always have mismatched socks?`,
`Would you rather talk to animals or talk to ghosts?`,
`Would you rather get caught singing loudly or dancing badly?`,
`Would you rather have x-ray vision or night vision?`,
`Would you rather be able to pause time or rewind time?`,
`Would you rather get stuck in an elevator with your teacher or your crush?`,
`Would you rather sneeze every time you talk or hiccup every time you laugh?`,
`Would you rather have unlimited video games or unlimited snacks?`,
`Would you rather be able to shapeshift into animals or into people?`,
`Would you rather always forget people’s names or always forget what day it is?`,
`Would you rather have laser eyes or ice breath?`,
`Would you rather your phone always be at 1% or your Wi-Fi always be slow?`,
`Would you rather accidentally like your crush’s old photo or accidentally text them “I love you”?`,
`Would you rather teleport but arrive 5 minutes late or run super fast but always sweat a lot?`,
`Would you rather never be able to stop dancing or never be able to stop singing?`,
`Would you rather fly like Iron Man or swing like Spider-Man?`,
`Would you rather always step on Lego or always stub your toe?`,
`Would you rather be the funniest in the group or the smartest in the group?`,
`Would you rather your voice crack every time you talk or trip every time you walk in front of people?`,
`Would you rather have unlimited candy or unlimited fries?`,
`Would you rather live in a house made of candy or a house made of pillows?`,
`Would you rather breathe underwater or never need sleep?`,
`Would you rather be caught picking your nose or be caught talking to yourself?`,
`Would you rather have a personal robot assistant or a flying skateboard?`,
`Would you rather teleport to the future or to the past?`,
`Would you rather fart every time you laugh or sneeze every time you smile?`,
`Would you rather have wings or a mermaid tail?`,
`Would you rather fail a test or embarrass yourself in PE class?`,
`Would you rather be famous for a meme or for a TikTok dance?`,
`Would you rather never run out of battery or never run out of data?`,
`Would you rather be able to stop time for 10 seconds or predict the future 10 seconds ahead?`,
`Would you rather trip in the cafeteria or spill food on yourself?`,
`Would you rather be the class clown or the class genius?`,
`Would you rather have your dream car or your dream house?`,
`Would you rather have magic hair that changes color or magic eyes that change color?`,
`Would you rather always get caught staring or always get caught daydreaming?`,
`Would you rather be able to talk in any language or talk to animals?`,
`Would you rather laugh so hard you cry or cry so hard you laugh?`,
`Would you rather wear pajamas to school or wear fancy clothes to gym class?`,
`Would you rather have super hearing or super smell?`,
`Would you rather be really good at dancing or really good at singing?`,
`Would you rather always have food stuck in your teeth or always have messy hair?`,
`Would you rather be able to clone yourself or read minds?`,
`Would you rather always be hungry or always be tired?`,
`Would you rather your parents find your embarrassing selfies or your friends?`,
`Would you rather be rich but bored or poor but always happy?`,
`Would you rather have a rewind button or a skip button in life?`,
`Would you rather fall asleep in class or accidentally snore loudly?`,
`Would you rather be a superhero or a villain?`,
`Would you rather go viral for a funny video or for something embarrassing?`,
`Would you rather fly in your dreams every night or control your dreams?`,
`Would you rather eat spicy food forever or sour food forever?`,
`Would you rather have your shoes squeak every step or your stomach growl loudly every hour?`,
`Would you rather be best friends with a celebrity or with a billionaire?`,
`Would you rather always smell like fries or always smell like chocolate?`,
`Would you rather have glowing eyes or glowing skin?`,
`Would you rather trip over nothing or spill water on yourself in public?`,
`Would you rather teleport to any bathroom instantly or always find free Wi-Fi anywhere?`,
`Would you rather control fire or control water?`,
`Would you rather sneeze glitter or fart confetti?`,
`Would you rather forget your lines on stage or forget your lyrics in karaoke?`,
`Would you rather eat your favorite food every day or try new food every day?`,
`Would you rather be the main character in a video game or in a movie?`,
`Would you rather always laugh at the wrong time or cry at the wrong time?`,
`Would you rather have a dragon pet or a unicorn pet?`,
`Would you rather have embarrassing photos leaked or embarrassing texts leaked?`,
`Would you rather be able to control the weather or control animals?`,
`Would you rather lose your phone or lose your wallet?`,
`Would you rather always talk too loudly or too quietly?`,
`Would you rather live in a cartoon world or a video game world?`,
`Would you rather be really tall like a giant or really small like an ant?`,
`Would you rather slip on a banana peel or get hit by a water balloon?`,
`Would you rather always forget your homework or always forget your lunch?`,
`Would you rather have magic shoes that make you run fast or magic glasses that make you smart?`,
`Would you rather be embarrassed once in front of your crush or every day in front of strangers?`,
`Would you rather play games all day or sleep all day?`,
`Would you rather be able to never feel pain or never feel fear?`,
`Would you rather sneeze every time you say “hello” or cough every time you say “bye”?`,
`Would you rather be a YouTube star or a movie star?`,
`Would you rather be stuck in traffic or stuck with slow Wi-Fi?`,
`Would you rather have unlimited snacks or unlimited games?`,
`Would you rather always laugh uncontrollably or never laugh at all?`,
`Would you rather be famous for one day or live quietly forever?`,
`Would you rather be able to control plants or control machines?`,
`Would you rather drop your phone in the toilet or on the road?`,
`Would you rather have a pet dinosaur or a pet robot?`,
`Would you rather sing everything you say or dance everywhere you go?`,
`Would you rather fart loudly in an exam or sneeze nonstop in an exam?`,
`Would you rather live without music or without movies?`,
`Would you rather be always clumsy or always forgetful?`,
`Would you rather be able to jump super high or run super fast?`,
`Would you rather have glowing hair or glowing nails?`,
`Would you rather everyone hear your thoughts for a day or everyone see your search history?`,
`Would you rather be the best at sports or the best at video games?`,
`Would you rather always be early or always be late?`,
`Would you rather have a magic backpack or magic shoes?`,
`Would you rather always say what you’re thinking or never be able to speak?`,
`Would you rather fail in front of everyone or win but trip on stage?`,
`Would you rather control dreams or enter other people’s dreams?`,
`Would you rather burp every time you talk or yawn every time you listen?`,
`Would you rather have unlimited ice cream or unlimited pizza?`,
`Would you rather forget people’s faces or people forget your face?`,
`Would you rather have stretchy arms or super tiny feet?`,
`Would you rather have your phone screen cracked or your laptop keyboard broken?`,
`Would you rather always forget lyrics or always forget movie lines?`,
`Would you rather be able to glow in the dark or disappear in shadows?`,
`Would you rather fall in public or laugh alone in public?`,
`Would you rather always be hungry but eat anything or always be full but never enjoy food?`,
`Would you rather control electricity or control gravity?`,
`Would you rather have a teacher read your diary or your parents?`,
`Would you rather be TikTok famous or Instagram famous?`,
`Would you rather swim with sharks or with crocodiles?`,
`Would you rather forget your best friend’s birthday or they forget yours?`,
`Would you rather always be barefoot or always wear wet socks?`,
`Would you rather have a magic pencil or a magic eraser?`,
`Would you rather sleep for 24 hours or stay awake for 48 hours?`,
`Would you rather get gum stuck in your hair or food stuck in your braces?`,
`Would you rather control shadows or control light?`,
`Would you rather be embarrassed by a stranger or by your crush?`,
`Would you rather have your stomach growl in silence or sneeze during a test?`,
`Would you rather be able to teleport only once a day or fly but very slowly?`,
`Would you rather always smell nice or always look good?`,
`Would you rather your friends read your texts or your teachers read them?`,
`Would you rather be in a comedy movie or an action movie?`,
`Would you rather burp glitter or fart sparkles?`,
`Would you rather be friends with a superhero or be a superhero?`,
`Would you rather live with only pizza or only burgers?`,
`Would you rather everyone forget your name or forget your birthday?`,
`Would you rather have an embarrassing ringtone or embarrassing wallpaper?`,
`Would you rather freeze everything you touch or burn everything you touch?`,
`Would you rather say “oops” after every word or “haha” after every sentence?`,
`Would you rather lose your homework or lose your lunch money?`,
`Would you rather sing really bad or dance really bad?`,
`Would you rather breathe underwater or fly in the sky?`,
`Would you rather wear mismatched shoes or mismatched clothes?`,
`Would you rather eat raw onion or eat raw garlic?`,
`Would you rather control clouds or control rainbows?`,
`Would you rather have a teacher read your notes aloud or your crush?`,
`Would you rather always have toothpaste on your face or ink on your hands?`,
`Would you rather have a secret superpower or a public one?`,
`Would you rather eat cold food forever or burnt food forever?`,
`Would you rather your parents find your embarrassing memes or your teacher?`,
`Would you rather have super stretchy arms or super tiny legs?`,
`Would you rather never get tired or never get bored?`,
`Would you rather be chased by 1 horse-sized duck or 100 duck-sized horses?`,
`Would you rather sneeze fire or sneeze ice?`,
`Would you rather live in your favorite game or your favorite cartoon?`,
`Would you rather wear socks on your hands or gloves on your feet?`,
`Would you rather have no eyebrows or no eyelashes?`,
`Would you rather slip on stage or forget your lines?`,
`Would you rather control sound or control silence?`,
`Would you rather eat spicy noodles or sour candies?`,
`Would you rather your crush see your embarrassing baby photos or hear your childhood stories?`,
`Would you rather be able to fly only 2 feet above the ground or breathe underwater for 10 minutes?`,
`Would you rather always trip on stairs or always spill drinks?`,
`Would you rather have your diary read by a sibling or by a stranger?`,
`Would you rather be good at roasting or good at flirting?`,
`Would you rather fall asleep in class or talk in your sleep during exams?`,
`Would you rather be able to freeze time or move super fast?`,
`Would you rather live with no mirrors or no photos?`,
`Would you rather say “LOL” out loud or “BRB” in real life?`,
`Would you rather eat fries with ice cream or pizza with chocolate?`,
`Would you rather have purple skin or green hair?`,
`Would you rather forget your crush’s name or call them the wrong name?`,
`Would you rather always sneeze loudly or hiccup quietly forever?`,
`Would you rather control wind or control fire?`,
`Would you rather always say what you’re thinking or never speak again?`,
`Would you rather fart in a job interview or hiccup in a presentation?`,
`Would you rather wear clown shoes for a year or clown wig for a year?`,
`Would you rather eat hot sauce or eat a whole lemon?`,
`Would you rather laugh like a goat or sneeze like a cat?`,
`Would you rather always be filmed or always be watched?`,
`Would you rather teleport into random places or into random times?`,
`Would you rather have a squeaky voice or a super deep voice forever?`,
`Would you rather fail your exam or fail at a TikTok dance?`,
`Would you rather live without chocolate or without chips?`,
`Would you rather grow taller every day or shrink smaller every day?`,
`Would you rather wear the same shirt forever or the same shoes forever?`,
`Would you rather sneeze glitter or cough bubbles?`,
`Would you rather always say rhymes or always speak in riddles?`,
`Would you rather be allergic to the sun or allergic to the cold?`,
`Would you rather have a talking pet or a flying pet?`,
`Would you rather lose all your games or lose all your snacks?`,
`Would you rather burp loudly every time you eat or sneeze every time you drink?`,
`Would you rather wear socks on your hands or shoes on your head?`,
`Would you rather forget how to walk or forget how to talk for a day?`,
`Would you rather sneeze slime or burp bubbles?`,
`Would you rather be remembered for something embarrassing or forgotten completely?`
];

/* ====== Lightweight helpers ====== */
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* parse a WYR question into left/right */
function splitQuestion(raw) {
  if (!raw || typeof raw !== 'string') return { left: raw || '', right: '' };

  // normalize smart quotes to plain quotes and trim
  let q = raw.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();

  // remove leading "Would you rather" if present (case-insensitive)
  q = q.replace(/^Would you rather\s*/i, '').replace(/\?$/, '').trim();

  // find the first ' or ' (space-or-space) case-insensitive
  const match = q.match(/\s+or\s+/i);
  if (match) {
    const idx = match.index;
    const left = q.slice(0, idx).trim();
    const right = q.slice(idx + match[0].length).trim();
    return {
      left: capitalizeSentence(left),
      right: capitalizeSentence(right)
    };
  }

  // fallback: try splitting on ' / ' or ' | ' or comma + or
  const altMatch = q.match(/\s+\/\s+/) || q.match(/\s+\|\s+/);
  if (altMatch) {
    const idx = altMatch.index;
    const left = q.slice(0, idx).trim();
    const right = q.slice(idx + altMatch[0].length).trim();
    return { left: capitalizeSentence(left), right: capitalizeSentence(right) };
  }

  // ultimate fallback: left is whole phrase, right is prompt
  return { left: capitalizeSentence(q), right: 'Choose!' };
}

function capitalizeSentence(s) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/* ====== DOM references & state ====== */
const leftEl = document.getElementById('leftSide');
const rightEl = document.getElementById('rightSide');
const indexLabel = document.getElementById('indexLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');

let order = [];
let current = 0;

/* initialize app (shuffled order on each load) */
function init() {
  order = Array.from({ length: questions.length }, (_, i) => i);
  shuffleArray(order);
  current = 0;
  render();
}

/* render current question by updating only textContent (fast) */
function render() {
  // guard
  if (!order || order.length === 0) {
    leftEl.textContent = 'No questions';
    rightEl.textContent = '';
    indexLabel.textContent = '0 of 0';
    return;
  }

  const idx = order[current];
  const q = questions[idx];
  const parts = splitQuestion(q);

  // update DOM — minimal changes
  leftEl.textContent = parts.left;
  rightEl.textContent = parts.right;

  indexLabel.textContent = `Question ${current + 1} of ${questions.length}`;

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current >= order.length - 1;

  // small subtle pop animation: uses transform & opacity only
  const wyrRow = document.getElementById('wyrRow');
  wyrRow.style.opacity = '0';
  wyrRow.style.transform = 'translateY(6px)';
  requestAnimationFrame(() => {
    wyrRow.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
    wyrRow.style.opacity = '1';
    wyrRow.style.transform = 'translateY(0)';
    // remove the transition after it's done to keep updates cheap
    setTimeout(() => { wyrRow.style.transition = ''; }, 280);
  });
}

/* navigation handlers */
nextBtn.addEventListener('click', () => {
  if (current < order.length - 1) current++;
  render();
});
prevBtn.addEventListener('click', () => {
  if (current > 0) current--;
  render();
});
shuffleBtn.addEventListener('click', () => {
  shuffleArray(order);
  current = 0;
  render();
});

/* keyboard: Arrow keys + Space */
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (current < order.length - 1) current++;
    else { shuffleArray(order); current = 0; }
    render();
  } else if (e.code === 'ArrowRight') {
    if (current < order.length - 1) current++;
    render();
  } else if (e.code === 'ArrowLeft') {
    if (current > 0) current--;
    render();
  }
});

/* Start when DOM ready */
document.addEventListener('DOMContentLoaded', init);
