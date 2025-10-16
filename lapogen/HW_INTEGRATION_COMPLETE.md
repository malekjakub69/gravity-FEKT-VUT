# Hardware Integration - DOKONČENO ✅

Hardware komunikace byla úspěšně implementována podle protokolu z [Optron_tester](https://github.com/marakaja/Optron_tester).

## Implementované funkce

### 1. Komunikační protokol (`src/hooks/useWebSerial.ts`)

**✅ Parsování dat:**
- Příchozí data z `measure_all` příkazu
- Formát: `freq=xxxx, amp=xxxx, offset=xxxx, voltled=xxxx, peek=xxxx, angle=xxxx`
- Parsované hodnoty se ukládají do `parsedData` state

**✅ Nastavení parametrů:**
```typescript
setParameters(amp: number, frequency: number, offset: number)
```
- Odesílá příkaz: `set_sin amp=<uA>, offset=<uA>, freq=<Hz>`
- Všechny hodnoty jsou v mikroampérech (uA) a Hz

**✅ Kalibrace nulového úhlu:**
```typescript
calibrateZeroAngle()
```
- Odesílá příkaz: `set_zero_angle`
- Uloží aktuální pozici AS5600 jako nulový referenční úhel

**✅ Měření:**
```typescript
measureAll()
```
- Odesílá příkaz: `measure_all`
- Vrací všechny aktuální hodnoty senzorů

### 2. Záložky s automatickým nastavením parametrů

**✅ Záložka 1: VA Charakteristika**
- Nastavení před měřením: `setParameters(0, 1000, proud)`
- Amplituda = 0 (DC)
- Frekvence = 1000 Hz (libovolná nenulová)
- Offset = zadaný proud (1-30000 uA)

**✅ Záložka 2: Úhel LED**
- Nastavení před měřením: `setParameters(amplituda, 500, amplituda/2)`
- Frekvence = 500 Hz (fixní)
- Offset = 50% amplitudy
- Amplituda podle uživatelského vstupu

**✅ Záložka 3: Frekvenční charakteristika**
- Nastavení před měřením: `setParameters(amplituda, frekvence, amplituda/2)`
- Frekvence = podle vstupu (1-100000 Hz)
- Offset = 50% amplitudy
- Kontrola pozice ramene (±5°)
- Tlačítko kalibrace nulového úhlu

**✅ Záložka 4: Lux-Amper**
- Nastavení před měřením: `setParameters(amplituda, 500, amplituda/2)`
- Frekvence = 500 Hz (fixní)
- Offset = 50% amplitudy
- Kontrola pozice ramene (±5°)

### 3. MeasurementDialog

**✅ Automatické měření:**
- Volá `measureAll()` každých 200 ms
- Zobrazuje live data: napětí (ADC), peek (ADC), úhel (°)
- Sběr vzorků pro průměrování (až 100 vzorků)
- Varování při nesprávné pozici ramene (záložky 3 a 4)

## Měřené hodnoty

Podle dokumentace Optron_tester:

- **freq** - aktuálně nastavená frekvence [Hz]
- **amp** - aktuálně nastavená amplituda [uA]
- **offset** - aktuálně nastavený offset [uA]
- **voltled** - ADC hodnota napětí na LED
- **peek** - ADC hodnota peek measurement
- **angle** - úhel z AS5600 senzoru [stupně]

## Sériová komunikace

- **Baudrate:** 115200
- **Format:** 8N1
- **Příkazy:** ASCII řádky ukončené CR nebo LF
- **Odpovědi:** ASCII řádky

## Testování

Pro otestování aplikace:

1. Připojte Optron_tester zařízení přes USB
2. Spusťte aplikaci (nebo dev server: `npm run dev`)
3. Klikněte na "Připojit port"
4. Vyberte sériový port zařízení
5. Zvolte záložku a začněte měřit

## Poznámky

- ADC hodnoty (voltled, peek) jsou zatím zobrazovány jako raw hodnoty
- Pokud je potřeba převést na mV, využijte vzorec z firmware (VREFINT kalibrace)
- Úhel je automaticky zarovnán podle uloženého zero-angle offsetu
- Pro změnu zero-angle použijte tlačítko kalibrace (záložka 3)

## Build

Build byl úspěšný:
```
✓ built in 956ms
dist/assets/index-DKWPGZ4C.js   432.36 kB │ gzip: 140.48 kB
```

Aplikace je připravena k použití! 🎉

