// Run: npx tsx scripts/assistant-test.mts   (checks the assistant against messy, real-world questions)
import { pathToFileURL } from 'node:url';
import { answer } from '../src/lib/assistant.ts';

const T0: [string, string[]][] = [
 ['hi',['greet']],['Good morning',['greet']],['heyyy there',['greet']],['how far',['greet']],['how are you doing today',['wellbeing']],
 ['hello sir good morning, i saw ur ad on facebook wanted to knw how much u charge for logo design pls',['pricing']],
 ['how much do you charge',['pricing']],['wat is ur price',['pricing']],['cost of a website?',['pricing']],['is it expensive',['pricing']],
 ['who owns this site',['owner']],['who is the owner of this website and where is the business headed',['owner','vision']],
 ['who made this',['owner']],['who built you',['owner']],['who is behind all this',['owner']],['your creator',['owner']],
 ['where is your office located',['location']],['where u dey based',['location']],['which city are you in',['location']],
 ['where is the business headed?',['vision']],['whats the future of empire digitals',['vision']],['what are your goals',['vision']],
 ['tell me about gravity',[]],['what is the capital of France',[]],['grammar mixed with other write up',[]],['asdf qwerty',[]],['how do I bake bread',[]],
 ['i want to build a website for my church',['webdev']],['can u make me a logo',['brand']],['need flyer design for my event',['brand']],
 ['do you build whatsapp bots for business',['bots']],['whatsap chatbot for my shop',['bots']],['I want to automate my business',['ai']],
 ['what packages do you offer',['packages']],['show me all packages',['packages']],['tell me about the growth package',['growth']],
 ['what comes with mega',['mega']],['starter package details',['starter']],['super package',['super']],['what is in the mini',['mini']],
 ['how much is the growth package',['growth','pricing']],
 ['how long does delivery take',['timeline']],['how fast can you deliver',['timeline']],['when will i get my design',['timeline']],['is it really 24 hours',['timeline']],
 ['how do i contact mishael',['contact']],['whats ur phone number',['contact']],['give me your email',['contact']],['can i call you',['contact']],
 ['customer care number',['support']],['i have a complaint',['support']],
 ['show me your portfolio',['portfolio']],['do you have samples of your work',['portfolio']],['i want to see previous projects',['portfolio']],
 ['i want to start a project',['start']],['how do i hire you',['start']],['are you available for a new job',['start']],
 ['do you teach web development',['training']],['can i learn from mishael',['training']],['any classes',['training']],
 ['are you a robot',['identity']],['who are you',['identity']],['are you chatgpt',['identity']],['are you a real person',['identity']],
 ['who is mishael',['about']],['tell me about mishael yakubu',['about']],['what does the ceo do',['about']],
 ['what is empire digitals',['company']],['tell me about your company',['company']],
 ['do you work with people in lagos',['remote']],['can u work for clients abroad',['remote']],
 ['do you have facebook',['social']],['your youtube channel',['social']],['instagram?',['social']],
 ['can you do seo',['seo']],['google registration for my business',['seo']],
 ['do you make ad videos',['video']],['i need a promo video',['video']],
 ['how do i switch to dark mode',['site-help']],['turn off sound',['site-help']],
 ['thank you so much',['thanks']],['thanks',['thanks']],['bye',['bye']],['ok',['ack']],['yes',['ack']],
 ['you are useless',['rude']],['tell me a joke',['fun']],['how old are you',['personal']],
 ['hi, what is your pricing and where are you located?',['pricing','location']],
 ['good evening. do u have a package for small business? and how long will it take',['packages','timeline']],
 ['PLEASE I NEED HELP URGENTLY',['help']],['what can you answer',['help']],
 ['do you give refund',['support']],['can i pay in installments',['trust']],['are you legit',['trust']],
 ['additional services',['additional']],['can you print banners',['additional']],['business cards',['additional']],
 ['i saw ur flyers on instagram and i like the design, i own a bakery in warri and i need a website with ordering, how much will it cost',['webdev']],
 ['abeg how i go take reach una',['contact']],
];

const T1: [string, string[]][] = [
 ['gravity of the situation is serious so who is the boss here',['owner']],
 ['my grammar is bad but i wan know ur location',['location']],
 ['good afternoon oga abeg wetin be your prize for website',['pricing']],
 ['i dey look for person wey fit build website for me',['webdev']],
 ['hw much u dey collect for flyer',['pricing']],
 ['pls what is the delivery time for logo',['timeline']],
 ['hello i hope you are doing great, i am a business owner in asaba and i want to put my shop on the internet',['webdev']],
 ['can i see some of the stuff you have done before',['portfolio']],
 ['what makes you different from other designers',[]],
 ['do you have an app',['software']],
 ['i need a mobile app for my school',['software']],
 ['can you manage my facebook page for me',['additional']],
 ['i need someone to run my social media every month',['additional']],
 ['wat services do u render',['packages']],
 ['what do u do',['packages']],
 ['tell me everything',[]],
 ['whatsapp number',['contact']],
 ['can i get ur number',['contact']],
 ['mishael email address',['contact']],
 ['where can i find you',['location']],
 ['are you in abuja',['remote']],
 ['do you sell phones',[]],
 ['what is the weather in ughelli',['location']],
 ['when was empire digitals founded',['company']],
 ['how many years of experience do you have',['about']],
 ['what technologies do you use',['stack']],
 ['do you use react',['stack']],
 ['i love your work',['thanks']],
 ['great site',['thanks']],
 ['can you reduce the price',['pricing']],
 ['is there a discount',['pricing']],
 ['how can i pay',['trust']],
 ['do you accept transfer',['trust']],
 ['i want to speak with mishael directly',['contact']],
 ['connect me to a human',['contact']],
 ['talk to a real person abeg',['identity']],
 ['i am interested',['start']],
 ['lets work together',['start']],
 ['how do we begin',['start']],
 ['when can you start',['start']],
 ['how long will the website take',['timeline']],
 ['what about the video packages',['video']],
 ['how many flyers in the starter',['starter']],
 ['how many banners come with the growth package',['growth']],
 ['does mega include seo',['mega']],
 ['what is in super and how much',['super','pricing']],
 ['who is the founder and what packages do you have',['about','packages']],
 ['what is your name',['identity']],
 ['are you human',['identity']],
 ['i want to subscribe to newsletter',['newsletter']],
 ['who is mishael and where is he based',['about','location']],
 ['can i see ur logo works',['brand']],
 ['ai automation',['ai']],
 ['website',['webdev']],
 ['logo',['brand']],
 ['price',['pricing']],
 ['packages',['packages']],
 ['hmmmm',['ack']],
 ['wwwwwwwww',[]],
 ['1234567',[]],
 ['the quick brown fox jumps over the lazy dog',[]],
 ['I would like to know whether you provide hosting services',[]],
 ['do you do video editing',['video']],
 ['are your packages cheap',['pricing']],
 ['i want the best package',['packages']],
 ['which package is best for a small business',['packages']],
 ['recommend a package for my restaurant',['packages']],
];

const T2: [string, string[]][] = [
 ['gravity pulls things down but what is the price of your website',['pricing']],
 ['my friend told me about you, he said your flyers are fire, how much for 5 flyers',['pricing']],
 ['who is the guy that runs this',['owner']],
 ['i wanna kno hu own dis place',['owner']],
 ['wetin be the plan for this business for the next 5 years',['vision']],
 ['are u guys planning to expand',['vision']],
 ['where is ur shop',['location']],
 
 ['can the website be ready by tomorrow',['timeline']],
 ['i need it urgently',['timeline']],
 ['what time do you open',['hours']],
 ['are you online',['hours']],
 ['do you reply on weekends',['hours']],
 ['i want a website like amazon',['webdev']],
 ['can you clone instagram',['software']],
 ['i need a logo and a website and flyers',['brand']],
 ['please i need a chatbot for my business whatsapp',['bots']],
 ['i want an ai that answers my customers',['bots']],
 ['can you automate my invoices',['ai']],
 ['do you do graphics',['brand']],
 ['i want to learn how to build websites',['training']],
 ['do you offer internship',['training']],
 ['what are the additional services',['additional']],
 ['what is included in the starter package',['starter']],
 ['difference between mini and growth',['mini','growth']],
 ['the mega package please',['mega']],
 ['tell me about ur super package',['super']],
 ['how much is mega',['mega','pricing']],
 ['link to your github',['social']],
 ['do you have linkedin',['social']],
 ['ur youtube channel name',['social']],
 ['where can i watch your videos',['video']],
 ['hello',['greet']],['hello good evening sir',['greet']],['gud morning',['greet']],['hiii',['greet']],
 ['hi how are you',['wellbeing']],['what is up',['greet']],
 ['i think i found a bug on your site',['support']],
 ['the site is not loading',['support']],
 ['thank you very much sir God bless you',['thanks']],
 ['ok thanks bye',['bye']],
 ['see you later',['bye']],
 ['are you better than chatgpt',['identity']],
 ['nonsense',['rude']],
 ['asdkjh kjhasd',[]],
 ['pizza recipe',[]],
 ['what is 2 + 2',[]],
 ['who won the world cup',[]],
 ['write me a poem',['fun']],
 ['how is the weather',['fun']],
 
];

export const CASES: [string, string[]][] = [...T0, ...T1, ...T2];

// Every reply must give the visitor a way forward, never a dead end.
const deadEnd = (q: string) => {
  const r = answer(q, { folders: [] });
  return !r.chips.length || /I don't have that detail/i.test(r.text);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let fail = 0;
  for (const [q, exp] of CASES) {
    const r = answer(q, { folders: [] });
    const got = r.topics ?? [];
    const ok = exp.length === 0 ? got.length === 0 : exp.every((e) => got.includes(e));
    if (!ok || deadEnd(q)) {
      fail++;
      console.log('FAIL', JSON.stringify(q), 'expected', exp, 'got', got);
    }
  }
  console.log(`${CASES.length - fail}/${CASES.length} passed`);
  process.exit(fail ? 1 : 0);
}
