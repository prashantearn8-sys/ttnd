// SVG recreation of the KCCITM GREATER NOIDA TIME TABLE (SECTION B1 - B10)
export function createKccitmTimetableSvg(selectedHighlightSection: string = 'B9'): string {
  const norm = selectedHighlightSection.trim().toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 620" width="1100" height="620">
    <rect width="1100" height="620" fill="#FFFFFF"/>
    
    <!-- Title Headers -->
    <text x="550" y="32" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#000000">KCCITM, GREATER NOIDA</text>
    <text x="550" y="54" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#000000">TIME TABLE (SECTION: B1 - B10) SESSION: 2026-27 SEMESTER-I</text>
    <text x="550" y="74" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#000000">DAY: FRIDAY</text>

    <!-- Table Grid Outline -->
    <!-- Column bounds:
         0 to 110: Section / Room
         110 to 225: 09:10 - 10:10
         225 to 345: 10:10 - 11:10
         345 to 465: 11:10 - 12:10
         465 to 570: 12:10 - 01:05 (LUNCH)
         570 to 690: 01:05 - 02:05
         690 to 810: 02:05 - 03:05
         810 to 930: 03:05 - 04:05
         930 to 1050: 04:05 - 05:00
    -->

    <!-- Header Row -->
    <rect x="25" y="85" width="1050" height="40" fill="#FFFFFF" stroke="#000000" stroke-width="1.5"/>
    <text x="75" y="103" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">SECTION /</text>
    <text x="75" y="118" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">ROOM</text>
    
    <line x1="125" y1="85" x2="125" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="180" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">09:10 - 10:10</text>
    
    <line x1="240" y1="85" x2="240" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="295" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">10:10 - 11:10</text>

    <line x1="355" y1="85" x2="355" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="410" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">11:10 - 12:10</text>

    <line x1="470" y1="85" x2="470" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="525" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">12:10 - 01:05</text>

    <line x1="580" y1="85" x2="580" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="635" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">01:05 - 02:05</text>

    <line x1="695" y1="85" x2="695" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="750" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">02:05 - 03:05</text>

    <line x1="810" y1="85" x2="810" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="865" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">03:05 - 04:05</text>

    <line x1="925" y1="85" x2="925" y2="125" stroke="#000000" stroke-width="1.5"/>
    <text x="990" y="109" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#000000">04:05 - 05:00</text>

    <!-- LUNCH COLUMN (Vertical from Y=125 to Y=595) -->
    <rect x="470" y="125" width="110" height="470" fill="#FFFFFF" stroke="#000000" stroke-width="1.5"/>
    <text x="525" y="270" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">L</text>
    <text x="525" y="310" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">U</text>
    <text x="525" y="350" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">N</text>
    <text x="525" y="390" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">C</text>
    <text x="525" y="430" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000000">H</text>

    <!-- ROW B1 (y=125, h=47) -->
    <rect x="25" y="125" width="100" height="47" fill="${norm === 'B1' ? '#FEF08A' : '#FFFFFF'}" stroke="#000000"/>
    <text x="75" y="145" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">B1</text>
    <text x="75" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">RN-402</text>
    <rect x="125" y="125" width="115" height="47" fill="#C7D2FE" stroke="#000000"/>
    <text x="182" y="145" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="182" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">KS</text>
    <rect x="240" y="125" width="115" height="47" fill="#FEF08A" stroke="#000000"/>
    <text x="297" y="145" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FME</text>
    <text x="297" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">GU</text>
    <rect x="355" y="125" width="115" height="47" fill="#93C5FD" stroke="#000000"/>
    <text x="412" y="145" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ECE</text>
    <text x="412" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">YG</text>
    <rect x="580" y="125" width="115" height="47" fill="#818CF8" stroke="#000000"/>
    <text x="637" y="145" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#FFFFFF">MATH</text>
    <text x="637" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#FFFFFF">MS</text>
    <rect x="695" y="125" width="115" height="47" fill="#4ADE80" stroke="#000000"/>
    <text x="752" y="145" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PPS</text>
    <text x="752" y="161" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">SP</text>
    <rect x="810" y="125" width="265" height="47" fill="#FFFFFF" stroke="#000000"/>

    <!-- ROW B2 (y=172, h=47) -->
    <rect x="25" y="172" width="100" height="47" fill="${norm === 'B2' ? '#FEF08A' : '#FFFFFF'}" stroke="#000000"/>
    <text x="75" y="192" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">B2</text>
    <text x="75" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">RN-502</text>
    <rect x="125" y="172" width="115" height="47" fill="#FBCFE8" stroke="#000000"/>
    <text x="182" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="182" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">PS</text>
    <rect x="240" y="172" width="115" height="47" fill="#FDBA74" stroke="#000000"/>
    <text x="297" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FME</text>
    <text x="297" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">SK</text>
    <rect x="355" y="172" width="115" height="47" fill="#FBCFE8" stroke="#000000"/>
    <text x="412" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="412" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">PS</text>
    <rect x="580" y="172" width="115" height="47" fill="#86EFAC" stroke="#000000"/>
    <text x="637" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ECE</text>
    <text x="637" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">PK</text>
    <rect x="695" y="172" width="115" height="47" fill="#93C5FD" stroke="#000000"/>
    <text x="752" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MATH</text>
    <text x="752" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">VK</text>
    <rect x="810" y="172" width="115" height="47" fill="#C4B5FD" stroke="#000000"/>
    <text x="867" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PPS</text>
    <text x="867" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">RA</text>
    <rect x="925" y="172" width="150" height="47" fill="#FDBA74" stroke="#000000"/>
    <text x="1000" y="192" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FME</text>
    <text x="1000" y="208" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">SK</text>

    <!-- ROW B9 (y=501, h=47) - SPECIAL HIGHLIGHT -->
    <rect x="25" y="501" width="100" height="47" fill="${norm === 'B9' ? '#FEF08A' : '#FFFFFF'}" stroke="#000000" stroke-width="${norm === 'B9' ? '2.5' : '1'}"/>
    <text x="75" y="521" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#000000">B9</text>
    <text x="75" y="537" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">RN-501</text>
    
    <rect x="125" y="501" width="115" height="47" fill="#E879F9" stroke="#000000"/>
    <text x="182" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">FME</text>
    <text x="182" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">RS</text>

    <rect x="240" y="501" width="115" height="47" fill="#FEF08A" stroke="#000000"/>
    <text x="297" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="297" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UJ</text>

    <rect x="355" y="501" width="115" height="47" fill="#F472B6" stroke="#000000"/>
    <text x="412" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TW</text>
    <text x="412" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">RK</text>

    <rect x="580" y="501" width="115" height="47" fill="#FEF08A" stroke="#000000"/>
    <text x="637" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="637" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">UJ</text>

    <rect x="695" y="501" width="115" height="47" fill="#BBF7D0" stroke="#000000"/>
    <text x="752" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">PPS</text>
    <text x="752" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">SH</text>

    <rect x="810" y="501" width="115" height="47" fill="#FFFFFF" stroke="#000000"/>
    <text x="867" y="521" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MATH</text>
    <text x="867" y="537" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">PR</text>

    <rect x="925" y="501" width="150" height="47" fill="#FFFFFF" stroke="#000000"/>

    <!-- ROW B10 (y=548, h=47) -->
    <rect x="25" y="548" width="100" height="47" fill="${norm === 'B10' ? '#FEF08A' : '#FFFFFF'}" stroke="#000000"/>
    <text x="75" y="568" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">B10</text>
    <text x="75" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">RN-505</text>
    <rect x="125" y="548" width="115" height="47" fill="#93C5FD" stroke="#000000"/>
    <text x="182" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MATH</text>
    <text x="182" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">PR</text>
    <rect x="240" y="548" width="115" height="47" fill="#38BDF8" stroke="#000000"/>
    <text x="297" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FME</text>
    <text x="297" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">GK</text>
    <rect x="355" y="548" width="115" height="47" fill="#EF4444" stroke="#000000"/>
    <text x="412" y="574" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#FFFFFF">DRONE LAB</text>
    <rect x="580" y="548" width="115" height="47" fill="#93C5FD" stroke="#000000"/>
    <text x="637" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MATH</text>
    <text x="637" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">PR</text>
    <rect x="695" y="548" width="115" height="47" fill="#F472B6" stroke="#000000"/>
    <text x="752" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">TW</text>
    <text x="752" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">RK</text>
    <rect x="810" y="548" width="115" height="47" fill="#BBF7D0" stroke="#000000"/>
    <text x="867" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PPS</text>
    <text x="867" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">SH</text>
    <rect x="925" y="548" width="150" height="47" fill="#FBCFE8" stroke="#000000"/>
    <text x="1000" y="568" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CHEM</text>
    <text x="1000" y="584" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">UJ</text>

    <!-- Indicative ellipses rows for middle sections B3-B8 -->
    <rect x="25" y="219" width="1050" height="282" fill="#F9FAFB" stroke="#000000" stroke-dasharray="2,2"/>
    <text x="550" y="260" font-family="Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle" fill="#4B5563">Sections B3, B4 (CAD LAB), B5, B6 (DRONE LAB), B7, B8 (CAD LAB)</text>
    <text x="550" y="285" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#6B7280">RN-301, RN-303, RN-305, RN-401, RN-403, RN-405</text>
    <text x="550" y="315" font-family="Arial, sans-serif" font-size="12" font-style="italic" text-anchor="middle" fill="#7C3AED">Row B9 highlighted below: FME (RS) → CHEM (UJ) → TW (RK) → LUNCH → CHEM (UJ) → PPS (SH) → MATH (PR)</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
