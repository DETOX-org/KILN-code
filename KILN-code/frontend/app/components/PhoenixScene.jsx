import styles from './PhoenixLanding.module.css';

export function PhoenixBird({ className, style }) {
  return <g className={className} style={style}>
    <g className={styles.tail} fill="none" strokeLinecap="round">
      <path d="M0 8 C-35 37 20 65 -22 113 C12 90 25 54 6 10" stroke="#c07832" strokeWidth="5" />
      <path d="M0 15 C20 47 -17 83 -7 128" stroke="#ffd182" strokeWidth="2" />
      <path d="M-4 10 C-50 55 -10 69 -43 95" stroke="#507ec1" strokeWidth="3" />
    </g>
    <g className={styles.leftWing}>
      <path d="M0 4 C-25 -35 -60 -27 -108 -88 C-100 -34 -75 -6 -20 18 C-68 8 -95 -2 -118 -31 C-96 18 -54 44 -5 29Z" fill="url(#phoenixGold)" />
      <path d="M-5 3 C-32 -20 -68 -27 -97 -64 C-78 -18 -38 3 -8 16" fill="#24416b" />
      <path d="M-10 22 Q-69 20 -105 -11" stroke="#ffdda1" fill="none" strokeWidth="2" />
    </g>
    <g className={styles.rightWing}>
      <path d="M0 4 C25 -35 60 -27 108 -88 C100 -34 75 -6 20 18 C68 8 95 -2 118 -31 C96 18 54 44 5 29Z" fill="url(#phoenixGold)" />
      <path d="M5 3 C32 -20 68 -27 97 -64 C78 -18 38 3 8 16" fill="#24416b" />
      <path d="M10 22 Q69 20 105 -11" stroke="#ffdda1" fill="none" strokeWidth="2" />
    </g>
    <path d="M-7 31 Q-14 7 -5 -12 Q-3 -34 11 -31 L23 -25 11 -19 Q7 -6 11 9 Q13 29 0 47Z" fill="url(#phoenixGold)" />
    <path d="M2 -26 Q-11 -44 -3 -49 Q0 -36 13 -32" fill="#ffdc94" />
    <circle cx="12" cy="-26" r="1.6" fill="#071124" />
    <path d="M-2 4 Q-6 23 0 35" stroke="#fff0bc" strokeWidth="2" fill="none" />
  </g>;
}

export default function PhoenixScene() {
  return <svg className={styles.sceneSvg} viewBox="0 0 1000 800" fill="none" role="img" aria-label="A coder at a laptop in a midnight studio. A golden phoenix flies behind the coder, circles the desk, and enters the glowing screen.">
    <defs>
      <linearGradient id="phoenixGold" x1="-90" y1="-80" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="#ffedb5" /><stop offset=".45" stopColor="#efb958" /><stop offset="1" stopColor="#a8562c" /></linearGradient>
      <linearGradient id="hoodie" x1="390" y1="400" x2="590" y2="630" gradientUnits="userSpaceOnUse"><stop stopColor="#314564" /><stop offset="1" stopColor="#101d33" /></linearGradient>
      <linearGradient id="display" x1="680" y1="370" x2="840" y2="520" gradientUnits="userSpaceOnUse"><stop stopColor="#14263c" /><stop offset="1" stopColor="#10233e" /></linearGradient>
      <linearGradient id="window" x1="260" y1="150" x2="490" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#102039" /><stop offset="1" stopColor="#091220" /></linearGradient>
      <radialGradient id="roomGlow"><stop stopColor="#203c6b" stopOpacity=".6" /><stop offset="1" stopColor="#203c6b" stopOpacity="0" /></radialGradient>
      <radialGradient id="goldGlow"><stop stopColor="#ffd078" stopOpacity=".65" /><stop offset="1" stopColor="#ffd078" stopOpacity="0" /></radialGradient>
      <pattern id="windowDots" width="34" height="30" patternUnits="userSpaceOnUse"><rect x="10" y="5" width="3" height="5" fill="#bead83" opacity=".35" /></pattern>
    </defs>
    <g className={styles.room}>
      <ellipse cx="610" cy="410" rx="390" ry="350" fill="url(#roomGlow)" />
      <path d="M170 670H940M204 702H915" stroke="#34445c" opacity=".4" />
      <path d="M190 240V144H519V449H190V270" stroke="#42516c" strokeWidth="2" />
      <path d="M204 157H506V436H204Z" fill="url(#window)" />
      <circle cx="425" cy="218" r="29" fill="#c6d0d7" opacity=".7" /><circle cx="438" cy="210" r="29" fill="#102039" />
      <path d="M207 353H242V316H285V362H320V278H355V325H398V297H442V338H505V436H207Z" fill="#0e1c31" />
      <path d="M207 353H242V316H285V362H320V278H355V325H398V297H442V338H505V436H207Z" fill="url(#windowDots)" />
      <path d="M352 157V437M204 295H506" stroke="#3f4f69" strokeWidth="4" />
      <path d="M180 448H531" stroke="#53617a" strokeWidth="6" />
      <g opacity=".6" stroke="#69798d"><path d="M619 197H897M635 209V232M882 209V232" strokeWidth="3" /><path d="M657 194V152H677V194M682 194V143H698V194M704 194V154H721V194M730 194L718 149L731 145L745 190" /></g>
      <path d="M809 194L803 166H851L844 194Z" fill="#415052" /><path d="M828 168Q806 147 820 123Q840 140 828 168M832 165Q834 139 859 140Q855 163 832 165" fill="#48736b" />
      <g opacity=".4" fill="#b9c6db">{[0,1,2,3,4,5,6,7].map(i=><circle key={i} cx={235+(i*61)%255} cy={180+(i*43)%99} r="1" />)}</g>
      <ellipse cx="653" cy="666" rx="251" ry="25" fill="#040912" opacity=".7" />
      <g className={styles.flightBack}><PhoenixBird /></g>
      <g className={styles.coder}>
        <path d="M414 590L398 672M516 592L550 672" stroke="#39465a" strokeWidth="11" />
        <path d="M401 486Q372 468 378 512L395 601Q401 625 435 623H526Q549 623 542 604L509 489Z" fill="#101a2a" stroke="#35445d" strokeWidth="2" />
        <path d="M455 563L578 557Q614 563 597 597L561 657H534L551 596H468Z" fill="#0b1628" stroke="#354259" strokeWidth="2" />
        <path d="M530 651H561L577 670H520Z" fill="#576075" />
        <path d="M426 396Q461 377 493 403L526 462L556 552Q514 584 420 565L401 462Q395 419 426 396Z" fill="url(#hoodie)" stroke="#536481" strokeWidth="1.6" />
        <path d="M450 386L447 407Q466 426 482 405L477 375Z" fill="#aa7864" />
        <path d="M427 333Q429 297 463 299Q499 300 498 333L497 357Q489 384 468 392Q437 381 432 359Z" fill="#c5997b" />
        <path d="M425 356Q400 309 430 291Q460 271 489 298Q512 312 499 338L486 331L479 316Q457 332 428 326Z" fill="#121b2a" stroke="#526079" strokeWidth="1.5" />
        <path d="M490 339L509 353L495 359" fill="#c5997b" /><path d="M480 341H493" stroke="#1c2535" strokeWidth="3" />
        <path d="M437 318Q404 318 418 362" stroke="#8e9ab0" strokeWidth="6" /><rect x="414" y="338" width="16" height="28" rx="7" fill="#243951" stroke="#95a4b9" /><path d="M422 367Q432 379 448 375" stroke="#95a4b9" strokeWidth="2" />
        <path d="M491 422Q519 421 527 465L543 500L624 500L631 522L523 531Q509 529 501 512L466 454" fill="url(#hoodie)" stroke="#536481" strokeWidth="2" />
        <path d="M618 500L646 492L666 500L660 508L638 513L630 520Z" fill="#c5997b" />
        <path d="M430 450L449 508L496 528" stroke="#8d9aad" strokeOpacity=".35" strokeWidth="2" />
      </g>
      <g className={styles.desk}>
        <path d="M536 535H925L891 558H512Z" fill="#39434e" stroke="#74808d" strokeWidth="1.5" />
        <path d="M514 558H892V568H514Z" fill="#1d2b3d" />
        <path d="M546 568L527 668M858 568L879 668" stroke="#3e4d63" strokeWidth="8" />
        <path d="M666 386Q665 376 676 377L842 396Q851 397 850 407L824 520L645 506Z" fill="#35435a" stroke="#8f9caf" strokeWidth="2" />
        <path d="M677 391L837 409L813 506L658 496Z" fill="url(#display)" />
        <path d="M645 506L824 520L785 536L604 520Z" fill="#68758a" stroke="#95a1b2" strokeWidth="1.5" />
        <path d="M656 513L791 524M646 518L779 529" stroke="#33465d" strokeWidth="4" strokeDasharray="5 3" />
        <g className={styles.screenCode} strokeLinecap="round" strokeWidth="3"><path d="M689 415L715 418M684 435L709 438M680 454L692 455M706 458L756 464M676 475L724 481" stroke="#debd76" /><path d="M725 419L794 427M720 440L774 446M733 482L770 486" stroke="#6e9aba" /><path d="M695 426L755 433M710 449L787 458M695 468L737 473" stroke="#54748f" /></g>
        <ellipse className={styles.screenGlow} cx="749" cy="453" rx="135" ry="104" fill="url(#goldGlow)" />
        <path d="M874 479H903V516Q891 527 877 517Z" fill="#162940" stroke="#8293ac" /><path d="M903 483Q923 480 916 499Q913 507 903 506" stroke="#8293ac" strokeWidth="3" />
        <path d="M885 469Q878 458 886 449" stroke="#9facbc" opacity=".35" strokeWidth="2" />
      </g>
      <g className={styles.flightFront}><PhoenixBird /></g>
      <g className={styles.sparkTrail} fill="#f4c576">{Array.from({length:12},(_,i)=><circle key={i} cx={-15-i*13} cy={20+Math.sin(i*1.5)*12+i*3} r={1+(i%3)*.45} opacity={1-i/13} />)}</g>
      <path d="M933 623L931 529M932 569Q900 563 894 538Q923 534 932 569M932 591Q960 578 966 551Q936 552 932 591M931 545Q912 522 923 498Q944 518 931 545" fill="#263e43" stroke="#5c7773" strokeWidth="2" /><path d="M909 616H954L947 669H917Z" fill="#24323d" stroke="#53616c" />
      <text x="267" y="727" fill="#69758b" fontFamily="monospace" fontSize="10" letterSpacing="3">A QUIET ROOM. AN UNTOLD POSSIBILITY.</text>
    </g>
  </svg>;
}
