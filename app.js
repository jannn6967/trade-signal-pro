// ==========================================
// TradeSignal Pro — Binary Options Signal Generator
// ==========================================

// ===== Currency Pairs Configuration =====
const PAIRS = [
  { symbol: 'FX:EURUSD', name: 'EUR/USD', flag: '🇪🇺🇺🇸', full: 'Euro / US Dollar' },
  { symbol: 'FX:GBPUSD', name: 'GBP/USD', flag: '🇬🇧🇺🇸', full: 'British Pound / US Dollar' },
  { symbol: 'FX:USDJPY', name: 'USD/JPY', flag: '🇺🇸🇯🇵', full: 'US Dollar / Japanese Yen' },
  { symbol: 'FX:USDCHF', name: 'USD/CHF', flag: '🇺🇸🇨🇭', full: 'US Dollar / Swiss Franc' },
  { symbol: 'FX:AUDUSD', name: 'AUD/USD', flag: '🇦🇺🇺🇸', full: 'Australian Dollar / US Dollar' },
  { symbol: 'FX:NZDUSD', name: 'NZD/USD', flag: '🇳🇿🇺🇸', full: 'New Zealand Dollar / US Dollar' },
  { symbol: 'FX:USDCAD', name: 'USD/CAD', flag: '🇺🇸🇨🇦', full: 'US Dollar / Canadian Dollar' },
  { symbol: 'FX:EURGBP', name: 'EUR/GBP', flag: '🇪🇺🇬🇧', full: 'Euro / British Pound' },
  { symbol: 'FX:EURJPY', name: 'EUR/JPY', flag: '🇪🇺🇯🇵', full: 'Euro / Japanese Yen' },
  { symbol: 'FX:GBPJPY', name: 'GBP/JPY', flag: '🇬🇧🇯🇵', full: 'British Pound / Japanese Yen' },
  { symbol: 'FX:AUDJPY', name: 'AUD/JPY', flag: '🇦🇺🇯🇵', full: 'Australian Dollar / Japanese Yen' },
  { symbol: 'FX:EURAUD', name: 'EUR/AUD', flag: '🇪🇺🇦🇺', full: 'Euro / Australian Dollar' },
  { symbol: 'FX:EURCHF', name: 'EUR/CHF', flag: '🇪🇺🇨🇭', full: 'Euro / Swiss Franc' },
  { symbol: 'FX:GBPCHF', name: 'GBP/CHF', flag: '🇬🇧🇨🇭', full: 'British Pound / Swiss Franc' },
  { symbol: 'FX:CADJPY', name: 'CAD/JPY', flag: '🇨🇦🇯🇵', full: 'Canadian Dollar / Japanese Yen' },
  { symbol: 'FX:NZDJPY', name: 'NZD/JPY', flag: '🇳🇿🇯🇵', full: 'New Zealand Dollar / Japanese Yen' },
  { symbol: 'FX:AUDNZD', name: 'AUD/NZD', flag: '🇦🇺🇳🇿', full: 'Australian Dollar / New Zealand Dollar' },
  { symbol: 'FX:EURNZD', name: 'EUR/NZD', flag: '🇪🇺🇳🇿', full: 'Euro / New Zealand Dollar' },
  { symbol: 'FX:GBPAUD', name: 'GBP/AUD', flag: '🇬🇧🇦🇺', full: 'British Pound / Australian Dollar' },
  { symbol: 'FX:GBPNZD', name: 'GBP/NZD', flag: '🇬🇧🇳🇿', full: 'British Pound / New Zealand Dollar' },
  { symbol: 'FX:CHFJPY', name: 'CHF/JPY', flag: '🇨🇭🇯🇵', full: 'Swiss Franc / Japanese Yen' },
  { symbol: 'FX:EURCAD', name: 'EUR/CAD', flag: '🇪🇺🇨🇦', full: 'Euro / Canadian Dollar' },
];

// ===== State =====
let currentPairIndex = 0;
let currentTimeframe = '1';
let tvWidget = null;
let signalHistory = [];
let pairSignalStates = {}; // stores signal dot states per pair

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  renderPairsList();
  initChart();
  bindTimeframeSelector();
  bindSearch();
});

// ===== Sidebar Pairs List =====
function renderPairsList(filter = '') {
  const container = document.getElementById('pairs-list');
  container.innerHTML = '';
  PAIRS.forEach((pair, index) => {
    if (filter && !pair.name.toLowerCase().includes(filter.toLowerCase()) &&
        !pair.full.toLowerCase().includes(filter.toLowerCase())) return;

    const item = document.createElement('div');
    item.className = `pair-item${index === currentPairIndex ? ' active' : ''}`;
    item.dataset.index = index;

    const signalState = pairSignalStates[pair.symbol] || '';
    const dotClass = signalState ? ` ${signalState}` : '';

    item.innerHTML = `
      <div class="pair-info">
        <span class="pair-flag">${pair.flag}</span>
        <div>
          <span class="pair-name">${pair.name}</span>
          <span class="pair-name-full">${pair.full}</span>
        </div>
      </div>
      <div class="pair-signal-dot${dotClass}"></div>
    `;
    item.addEventListener('click', () => selectPair(index));
    container.appendChild(item);
  });
}

function selectPair(index) {
  currentPairIndex = index;
  const pair = PAIRS[index];
  document.getElementById('current-pair-name').textContent = pair.name;
  document.getElementById('current-pair-badge').textContent = 'Forex';

  // Update active state
  document.querySelectorAll('.pair-item').forEach((el, i) => {
    el.classList.toggle('active', parseInt(el.dataset.index) === index);
  });

  // Reinitialize chart
  initChart();

  // Clear current signal display (keep history)
  document.getElementById('signal-result').style.display = 'none';
  document.getElementById('empty-signal').style.display = 'flex';
  document.getElementById('analysis-result').style.display = 'none';
  document.getElementById('empty-analysis').style.display = 'flex';
}

function bindSearch() {
  document.getElementById('pair-search').addEventListener('input', (e) => {
    renderPairsList(e.target.value);
  });
}

// ===== TradingView Chart =====
function initChart() {
  const container = document.getElementById('tradingview-chart');
  container.innerHTML = '';

  tvWidget = new TradingView.widget({
    container_id: 'tradingview-chart',
    symbol: PAIRS[currentPairIndex].symbol,
    interval: currentTimeframe,
    timezone: 'Etc/UTC',
    theme: 'dark',
    style: '1',
    locale: 'en',
    toolbar_bg: '#111827',
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    withdateranges: true,
    allow_symbol_change: false,
    autosize: true,
    studies: [
      'RSI@tv-basicstudies',
      'MACD@tv-basicstudies',
      'BB@tv-basicstudies'
    ],
    details: true,
    hotlist: false,
    calendar: false,
  });
}

// ===== Timeframe Selector =====
function bindTimeframeSelector() {
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTimeframe = btn.dataset.tf;
      initChart();
    });
  });
}

// ===== Tab Switching =====
function switchTab(tabName) {
  document.querySelectorAll('.signal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(t => {
    t.classList.toggle('active', t.id === `tab-${tabName}`);
  });
}

// ==========================================
// TECHNICAL ANALYSIS ENGINE
// ==========================================

// Generate pseudo-realistic market data for analysis
function generateMarketData(pair, timeframe) {
  const seed = hashCode(pair.symbol + timeframe + new Date().toISOString().slice(0, 13));
  const rng = seededRandom(seed);
  
  const dataPoints = 200;
  const data = [];
  
  // Base price depending on pair
  let basePrice = getBasePrice(pair.symbol);
  let price = basePrice;
  
  // Generate OHLC data
  for (let i = 0; i < dataPoints; i++) {
    const volatility = basePrice * 0.001;
    const change = (rng() - 0.48) * volatility;
    const open = price;
    const high = open + Math.abs(rng() * volatility);
    const low = open - Math.abs(rng() * volatility);
    const close = open + change;
    const volume = Math.floor(rng() * 10000) + 1000;
    
    data.push({ open, high, low, close, volume });
    price = close;
  }
  
  return data;
}

function getBasePrice(symbol) {
  const prices = {
    'FX:EURUSD': 1.0850, 'FX:GBPUSD': 1.2650, 'FX:USDJPY': 149.50,
    'FX:USDCHF': 0.8820, 'FX:AUDUSD': 0.6520, 'FX:NZDUSD': 0.6120,
    'FX:USDCAD': 1.3580, 'FX:EURGBP': 0.8575, 'FX:EURJPY': 162.20,
    'FX:GBPJPY': 189.10, 'FX:AUDJPY': 97.50, 'FX:EURAUD': 1.6640,
    'FX:EURCHF': 0.9570, 'FX:GBPCHF': 1.1160, 'FX:CADJPY': 110.10,
    'FX:NZDJPY': 91.50, 'FX:AUDNZD': 1.0650, 'FX:EURNZD': 1.7730,
    'FX:GBPAUD': 1.9410, 'FX:GBPNZD': 2.0680, 'FX:CHFJPY': 169.60,
    'FX:EURCAD': 1.4730,
  };
  return prices[symbol] || 1.0;
}

// Simple hash function
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Seeded random number generator
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ===== Indicator Calculations =====

function calculateSMA(data, period) {
  const closes = data.map(d => d.close);
  const sma = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

function calculateEMA(data, period) {
  const closes = data.map(d => d.close);
  const ema = [];
  const multiplier = 2 / (period + 1);
  ema.push(closes[0]);
  for (let i = 1; i < closes.length; i++) {
    ema.push((closes[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }
  return ema;
}

function calculateRSI(data, period = 14) {
  const closes = data.map(d => d.close);
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  const rsiValues = [];
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push(100 - (100 / (1 + rs)));
  }
  
  return rsiValues;
}

function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  
  // Signal line (9-period EMA of MACD)
  const signalData = macdLine.map(v => ({ close: v }));
  const signalLine = calculateEMA(signalData, 9);
  
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  
  return { macdLine, signalLine, histogram };
}

function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  const closes = data.map(d => d.close);
  
  const upper = [];
  const lower = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const stdDev = Math.sqrt(slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period);
      upper.push(mean + multiplier * stdDev);
      lower.push(mean - multiplier * stdDev);
    }
  }
  
  return { upper, middle: sma, lower };
}

function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
  const kValues = [];
  
  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    const k = high === low ? 50 : ((data[i].close - low) / (high - low)) * 100;
    kValues.push(k);
  }
  
  // %D is SMA of %K
  const dValues = [];
  for (let i = 0; i < kValues.length; i++) {
    if (i < dPeriod - 1) {
      dValues.push(null);
    } else {
      const sum = kValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      dValues.push(sum / dPeriod);
    }
  }
  
  return { k: kValues, d: dValues };
}

// ===== CANDLESTICK PATTERN DETECTION =====

function detectCandlestickPatterns(data) {
  const patterns = [];
  const len = data.length;
  if (len < 3) return patterns;
  
  const recent = data.slice(-5);
  const last = recent[recent.length - 1];
  const prev = recent[recent.length - 2];
  const prev2 = recent.length >= 3 ? recent[recent.length - 3] : null;
  
  const bodySize = Math.abs(last.close - last.open);
  const upperWick = last.high - Math.max(last.close, last.open);
  const lowerWick = Math.min(last.close, last.open) - last.low;
  const totalRange = last.high - last.low;
  const isBullish = last.close > last.open;
  const isBearish = last.close < last.open;
  
  const prevBody = Math.abs(prev.close - prev.open);
  const prevBullish = prev.close > prev.open;
  const prevBearish = prev.close < prev.open;
  
  // 1. Doji
  if (totalRange > 0 && bodySize / totalRange < 0.1) {
    patterns.push({ name: 'Doji', type: 'neutral', icon: '➕', desc: 'Indecision candle, potential reversal' });
  }
  
  // 2. Hammer (bullish reversal at bottom)
  if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5 && totalRange > 0) {
    patterns.push({ name: 'Hammer', type: 'bullish', icon: '🔨', desc: 'Bullish reversal at support' });
  }
  
  // 3. Inverted Hammer
  if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5 && totalRange > 0) {
    patterns.push({ name: 'Inverted Hammer', type: 'bullish', icon: '🔨', desc: 'Potential bullish reversal' });
  }
  
  // 4. Hanging Man (bearish at top — same shape as hammer but at top)
  if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5 && prevBullish) {
    patterns.push({ name: 'Hanging Man', type: 'bearish', icon: '☠️', desc: 'Bearish reversal at resistance' });
  }
  
  // 5. Shooting Star
  if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.3 && prevBullish) {
    patterns.push({ name: 'Shooting Star', type: 'bearish', icon: '⭐', desc: 'Bearish reversal signal' });
  }
  
  // 6. Bullish Engulfing
  if (isBullish && prevBearish && last.open <= prev.close && last.close >= prev.open) {
    patterns.push({ name: 'Bullish Engulfing', type: 'bullish', icon: '🟢', desc: 'Strong bullish reversal' });
  }
  
  // 7. Bearish Engulfing
  if (isBearish && prevBullish && last.open >= prev.close && last.close <= prev.open) {
    patterns.push({ name: 'Bearish Engulfing', type: 'bearish', icon: '🔴', desc: 'Strong bearish reversal' });
  }
  
  // 8. Morning Star (3-candle bullish reversal)
  if (prev2) {
    const prev2Bearish = prev2.close < prev2.open;
    const prev2Body = Math.abs(prev2.close - prev2.open);
    const prevSmallBody = prevBody < prev2Body * 0.3;
    if (prev2Bearish && prevSmallBody && isBullish && last.close > (prev2.open + prev2.close) / 2) {
      patterns.push({ name: 'Morning Star', type: 'bullish', icon: '🌅', desc: '3-candle bullish reversal' });
    }
  }
  
  // 9. Evening Star (3-candle bearish reversal)
  if (prev2) {
    const prev2Bullish = prev2.close > prev2.open;
    const prev2Body = Math.abs(prev2.close - prev2.open);
    const prevSmallBody = prevBody < prev2Body * 0.3;
    if (prev2Bullish && prevSmallBody && isBearish && last.close < (prev2.open + prev2.close) / 2) {
      patterns.push({ name: 'Evening Star', type: 'bearish', icon: '🌆', desc: '3-candle bearish reversal' });
    }
  }
  
  // 10. Three White Soldiers
  if (prev2) {
    const all3Bullish = isBullish && prevBullish && prev2.close > prev2.open;
    const ascending = last.close > prev.close && prev.close > prev2.close;
    if (all3Bullish && ascending) {
      patterns.push({ name: 'Three White Soldiers', type: 'bullish', icon: '🏳️', desc: 'Strong bullish continuation' });
    }
  }
  
  // 11. Three Black Crows
  if (prev2) {
    const all3Bearish = isBearish && prevBearish && prev2.close < prev2.open;
    const descending = last.close < prev.close && prev.close < prev2.close;
    if (all3Bearish && descending) {
      patterns.push({ name: 'Three Black Crows', type: 'bearish', icon: '🐦‍⬛', desc: 'Strong bearish continuation' });
    }
  }
  
  // 12. Piercing Line
  if (prevBearish && isBullish && last.open < prev.close && last.close > (prev.open + prev.close) / 2) {
    patterns.push({ name: 'Piercing Line', type: 'bullish', icon: '📌', desc: 'Bullish reversal pattern' });
  }
  
  // 13. Dark Cloud Cover
  if (prevBullish && isBearish && last.open > prev.close && last.close < (prev.open + prev.close) / 2) {
    patterns.push({ name: 'Dark Cloud Cover', type: 'bearish', icon: '🌧️', desc: 'Bearish reversal pattern' });
  }
  
  // 14. Bullish Harami
  if (prevBearish && isBullish && last.open > prev.close && last.close < prev.open && bodySize < prevBody * 0.6) {
    patterns.push({ name: 'Bullish Harami', type: 'bullish', icon: '🤰', desc: 'Inside bar bullish reversal' });
  }
  
  // 15. Bearish Harami
  if (prevBullish && isBearish && last.open < prev.close && last.close > prev.open && bodySize < prevBody * 0.6) {
    patterns.push({ name: 'Bearish Harami', type: 'bearish', icon: '🤰', desc: 'Inside bar bearish reversal' });
  }
  
  // 16. Spinning Top
  if (totalRange > 0 && bodySize / totalRange < 0.3 && upperWick > bodySize && lowerWick > bodySize) {
    patterns.push({ name: 'Spinning Top', type: 'neutral', icon: '🔄', desc: 'Market indecision' });
  }
  
  return patterns;
}

// ===== TRADING STRATEGIES =====

function analyzeStrategies(data, indicators) {
  const strategies = [];
  const { rsi, macd, bollinger, stochastic, ema20, ema50, ema200, sma20 } = indicators;
  const lastClose = data[data.length - 1].close;
  
  // 1. RSI Divergence Strategy
  const rsiLast = rsi[rsi.length - 1];
  const rsiPrev = rsi[rsi.length - 5] || rsi[0];
  const priceLast = data[data.length - 1].close;
  const pricePrev = data[data.length - 5] ? data[data.length - 5].close : data[0].close;
  
  let rsiSignal = 'neutral';
  let rsiDetail = '';
  if (rsiLast < 30) {
    rsiSignal = 'bullish';
    rsiDetail = `RSI oversold at ${rsiLast.toFixed(1)} — potential reversal up`;
  } else if (rsiLast > 70) {
    rsiSignal = 'bearish';
    rsiDetail = `RSI overbought at ${rsiLast.toFixed(1)} — potential reversal down`;
  } else if (priceLast > pricePrev && rsiLast < rsiPrev) {
    rsiSignal = 'bearish';
    rsiDetail = `Bearish divergence: price up but RSI down (${rsiLast.toFixed(1)})`;
  } else if (priceLast < pricePrev && rsiLast > rsiPrev) {
    rsiSignal = 'bullish';
    rsiDetail = `Bullish divergence: price down but RSI up (${rsiLast.toFixed(1)})`;
  } else {
    rsiDetail = `RSI neutral at ${rsiLast.toFixed(1)}`;
  }
  strategies.push({
    name: 'RSI Divergence',
    signal: rsiSignal,
    detail: rsiDetail,
    confidence: rsiSignal !== 'neutral' ? 70 + Math.floor(Math.abs(rsiLast - 50) * 0.6) : 40
  });
  
  // 2. MACD Crossover Strategy
  const macdLast = macd.macdLine[macd.macdLine.length - 1];
  const signalLast = macd.signalLine[macd.signalLine.length - 1];
  const macdPrev = macd.macdLine[macd.macdLine.length - 2];
  const signalPrev = macd.signalLine[macd.signalLine.length - 2];
  const histLast = macd.histogram[macd.histogram.length - 1];
  
  let macdSignal = 'neutral';
  let macdDetail = '';
  if (macdPrev <= signalPrev && macdLast > signalLast) {
    macdSignal = 'bullish';
    macdDetail = 'Bullish MACD crossover detected';
  } else if (macdPrev >= signalPrev && macdLast < signalLast) {
    macdSignal = 'bearish';
    macdDetail = 'Bearish MACD crossover detected';
  } else if (macdLast > signalLast && histLast > 0) {
    macdSignal = 'bullish';
    macdDetail = 'MACD above signal line, histogram positive';
  } else if (macdLast < signalLast && histLast < 0) {
    macdSignal = 'bearish';
    macdDetail = 'MACD below signal line, histogram negative';
  } else {
    macdDetail = 'MACD showing no clear crossover';
  }
  strategies.push({
    name: 'MACD Crossover',
    signal: macdSignal,
    detail: macdDetail,
    confidence: macdSignal !== 'neutral' ? 65 + Math.floor(Math.abs(histLast) * 1000) : 35
  });
  
  // 3. Bollinger Bands Bounce Strategy
  const bbUpper = bollinger.upper[bollinger.upper.length - 1];
  const bbLower = bollinger.lower[bollinger.lower.length - 1];
  const bbMiddle = bollinger.middle[bollinger.middle.length - 1];
  
  let bbSignal = 'neutral';
  let bbDetail = '';
  if (lastClose <= bbLower) {
    bbSignal = 'bullish';
    bbDetail = 'Price touching lower Bollinger Band — bounce expected';
  } else if (lastClose >= bbUpper) {
    bbSignal = 'bearish';
    bbDetail = 'Price touching upper Bollinger Band — pullback expected';
  } else if (lastClose < bbMiddle) {
    bbSignal = 'bearish';
    bbDetail = 'Price below BB midline';
  } else {
    bbSignal = 'bullish';
    bbDetail = 'Price above BB midline';
  }
  const bbWidth = bbUpper - bbLower;
  const bbPos = (lastClose - bbLower) / bbWidth;
  strategies.push({
    name: 'Bollinger Bounce',
    signal: bbSignal,
    detail: bbDetail,
    confidence: (bbPos < 0.1 || bbPos > 0.9) ? 80 : 50
  });
  
  // 4. Moving Average Crossover (Golden Cross / Death Cross)
  const ema50Last = ema50[ema50.length - 1];
  const ema200Last = ema200[ema200.length - 1];
  const ema50Prev = ema50[ema50.length - 5] || ema50[0];
  const ema200Prev = ema200[ema200.length - 5] || ema200[0];
  
  let maSignal = 'neutral';
  let maDetail = '';
  if (ema50Prev <= ema200Prev && ema50Last > ema200Last) {
    maSignal = 'bullish';
    maDetail = 'Golden Cross: EMA50 crossed above EMA200';
  } else if (ema50Prev >= ema200Prev && ema50Last < ema200Last) {
    maSignal = 'bearish';
    maDetail = 'Death Cross: EMA50 crossed below EMA200';
  } else if (ema50Last > ema200Last) {
    maSignal = 'bullish';
    maDetail = 'EMA50 above EMA200 — bullish trend';
  } else {
    maSignal = 'bearish';
    maDetail = 'EMA50 below EMA200 — bearish trend';
  }
  strategies.push({
    name: 'MA Crossover',
    signal: maSignal,
    detail: maDetail,
    confidence: maSignal !== 'neutral' ? 60 + Math.floor(Math.abs(ema50Last - ema200Last) / ema200Last * 10000) : 40
  });
  
  // 5. Stochastic Reversal Strategy
  const stochK = stochastic.k[stochastic.k.length - 1];
  const stochD = stochastic.d[stochastic.d.length - 1];
  const stochKPrev = stochastic.k[stochastic.k.length - 2];
  const stochDPrev = stochastic.d[stochastic.d.length - 2] || stochD;
  
  let stochSignal = 'neutral';
  let stochDetail = '';
  if (stochK < 20 && stochKPrev <= stochDPrev && stochK > stochD) {
    stochSignal = 'bullish';
    stochDetail = `Stochastic bullish crossover in oversold zone (K: ${stochK.toFixed(1)})`;
  } else if (stochK > 80 && stochKPrev >= stochDPrev && stochK < stochD) {
    stochSignal = 'bearish';
    stochDetail = `Stochastic bearish crossover in overbought zone (K: ${stochK.toFixed(1)})`;
  } else if (stochK < 20) {
    stochSignal = 'bullish';
    stochDetail = `Stochastic oversold (K: ${stochK.toFixed(1)})`;
  } else if (stochK > 80) {
    stochSignal = 'bearish';
    stochDetail = `Stochastic overbought (K: ${stochK.toFixed(1)})`;
  } else {
    stochDetail = `Stochastic neutral (K: ${stochK.toFixed(1)}, D: ${(stochD || 0).toFixed(1)})`;
  }
  strategies.push({
    name: 'Stochastic Reversal',
    signal: stochSignal,
    detail: stochDetail,
    confidence: stochSignal !== 'neutral' ? 65 + Math.floor(Math.abs(stochK - 50) * 0.5) : 40
  });
  
  // 6. Support/Resistance Breakout
  const recentHigh = Math.max(...data.slice(-50).map(d => d.high));
  const recentLow = Math.min(...data.slice(-50).map(d => d.low));
  const range = recentHigh - recentLow;
  const proximityThreshold = range * 0.05;
  
  let srSignal = 'neutral';
  let srDetail = '';
  if (lastClose >= recentHigh - proximityThreshold) {
    srSignal = 'bullish';
    srDetail = `Price near resistance breakout (${recentHigh.toFixed(5)})`;
  } else if (lastClose <= recentLow + proximityThreshold) {
    srSignal = 'bearish';
    srDetail = `Price near support breakdown (${recentLow.toFixed(5)})`;
  } else {
    srDetail = `Price in range: S ${recentLow.toFixed(5)} — R ${recentHigh.toFixed(5)}`;
  }
  strategies.push({
    name: 'S/R Breakout',
    signal: srSignal,
    detail: srDetail,
    confidence: srSignal !== 'neutral' ? 70 : 35
  });
  
  // 7. Trend Following (multi-indicator)
  const ema20Last = ema20[ema20.length - 1];
  const trendUp = lastClose > ema20Last && ema20Last > ema50Last && ema50Last > ema200Last;
  const trendDown = lastClose < ema20Last && ema20Last < ema50Last && ema50Last < ema200Last;
  
  let trendSignal = 'neutral';
  let trendDetail = '';
  if (trendUp) {
    trendSignal = 'bullish';
    trendDetail = 'Strong uptrend: Price > EMA20 > EMA50 > EMA200';
  } else if (trendDown) {
    trendSignal = 'bearish';
    trendDetail = 'Strong downtrend: Price < EMA20 < EMA50 < EMA200';
  } else if (lastClose > ema50Last) {
    trendSignal = 'bullish';
    trendDetail = 'Moderate bullish: Price above EMA50';
  } else {
    trendSignal = 'bearish';
    trendDetail = 'Moderate bearish: Price below EMA50';
  }
  strategies.push({
    name: 'Trend Following',
    signal: trendSignal,
    detail: trendDetail,
    confidence: (trendUp || trendDown) ? 85 : 50
  });
  
  // 8. Pattern-Based (candlestick + indicator confluence)
  const patterns = detectCandlestickPatterns(data);
  const bullishPatterns = patterns.filter(p => p.type === 'bullish');
  const bearishPatterns = patterns.filter(p => p.type === 'bearish');
  
  let patternStratSignal = 'neutral';
  let patternDetail = '';
  if (bullishPatterns.length > bearishPatterns.length && rsiLast < 50) {
    patternStratSignal = 'bullish';
    patternDetail = `${bullishPatterns.map(p => p.name).join(', ')} + RSI confirmation`;
  } else if (bearishPatterns.length > bullishPatterns.length && rsiLast > 50) {
    patternStratSignal = 'bearish';
    patternDetail = `${bearishPatterns.map(p => p.name).join(', ')} + RSI confirmation`;
  } else if (patterns.length > 0) {
    patternDetail = `Patterns found: ${patterns.map(p => p.name).join(', ')} — no confluence`;
  } else {
    patternDetail = 'No significant candlestick patterns detected';
  }
  strategies.push({
    name: 'Pattern + Confluence',
    signal: patternStratSignal,
    detail: patternDetail,
    confidence: patternStratSignal !== 'neutral' ? 75 : 30
  });
  
  // Cap confidences at 95
  strategies.forEach(s => { s.confidence = Math.min(s.confidence, 95); });
  
  return strategies;
}

// ===== COMPOSITE SIGNAL GENERATION =====

function generateCompositeSignal(pair, timeframe) {
  const data = generateMarketData(pair, timeframe);
  
  // Calculate all indicators
  const rsi = calculateRSI(data, 14);
  const macdResult = calculateMACD(data);
  const bollinger = calculateBollingerBands(data, 20, 2);
  const stochastic = calculateStochastic(data, 14, 3);
  const ema20 = calculateEMA(data, 20);
  const ema50 = calculateEMA(data, 50);
  const ema200 = calculateEMA(data, 200);
  const sma20 = calculateSMA(data, 20);
  
  const indicators = {
    rsi, macd: macdResult, bollinger, stochastic,
    ema20, ema50, ema200, sma20
  };
  
  // Detect patterns
  const patterns = detectCandlestickPatterns(data);
  
  // Analyze strategies
  const strategies = analyzeStrategies(data, indicators);
  
  // Compute composite score
  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;
  
  strategies.forEach(s => {
    const weight = s.confidence / 100;
    totalWeight += weight;
    if (s.signal === 'bullish') bullishScore += weight;
    else if (s.signal === 'bearish') bearishScore += weight;
  });
  
  // Add pattern influence
  patterns.forEach(p => {
    if (p.type === 'bullish') bullishScore += 0.3;
    else if (p.type === 'bearish') bearishScore += 0.3;
    totalWeight += 0.3;
  });
  
  const bullishPct = totalWeight > 0 ? (bullishScore / totalWeight) * 100 : 50;
  const bearishPct = totalWeight > 0 ? (bearishScore / totalWeight) * 100 : 50;
  
  const direction = bullishPct >= bearishPct ? 'CALL' : 'PUT';
  const confidence = Math.round(Math.max(bullishPct, bearishPct));
  const clampedConfidence = Math.min(Math.max(confidence, 25), 95);
  
  let strength = 'weak';
  if (clampedConfidence >= 75) strength = 'strong';
  else if (clampedConfidence >= 55) strength = 'medium';
  
  // Determine recommended expiry
  const tfLabels = { '1': '1 Min', '5': '5 Min', '15': '15 Min', '30': '30 Min', '60': '1 Hour', '240': '4 Hours', 'D': '1 Day' };
  const expiryMap = { '1': '2-5 Min', '5': '10-15 Min', '15': '30-45 Min', '30': '1-2 Hours', '60': '2-4 Hours', '240': '8-12 Hours', 'D': '1-3 Days' };
  
  const now = new Date();
  
  // Last indicator values for display
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macdResult.histogram[macdResult.histogram.length - 1];
  const lastStochK = stochastic.k[stochastic.k.length - 1];
  const lastStochD = stochastic.d[stochastic.d.length - 1] || 0;
  const lastClose = data[data.length - 1].close;
  const bbUpper = bollinger.upper[bollinger.upper.length - 1];
  const bbLower = bollinger.lower[bollinger.lower.length - 1];
  const bbMiddle = bollinger.middle[bollinger.middle.length - 1];
  
  return {
    pair,
    direction,
    confidence: clampedConfidence,
    strength,
    timeframe: tfLabels[timeframe] || timeframe,
    expiry: expiryMap[timeframe] || '5-15 Min',
    entryTime: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    entryDate: now.toLocaleDateString('en-GB'),
    patterns,
    strategies,
    indicators: {
      rsi: lastRSI,
      macd: lastMACD,
      stochK: lastStochK,
      stochD: lastStochD,
      price: lastClose,
      bbUpper, bbLower, bbMiddle,
      ema20: ema20[ema20.length - 1],
      ema50: ema50[ema50.length - 1],
      ema200: ema200[ema200.length - 1],
    }
  };
}

// ===== SIGNAL GENERATION UI =====

async function generateSignal() {
  const btn = document.getElementById('generate-btn');
  btn.classList.add('analyzing');
  
  // Simulate analysis time
  await sleep(1500 + Math.random() * 1000);
  
  const pair = PAIRS[currentPairIndex];
  const signal = generateCompositeSignal(pair, currentTimeframe);
  
  // Update sidebar dot
  pairSignalStates[pair.symbol] = signal.direction.toLowerCase();
  renderPairsList(document.getElementById('pair-search').value);
  
  // Add to history
  signalHistory.unshift(signal);
  if (signalHistory.length > 50) signalHistory.pop();
  
  // Render signal
  renderSignal(signal);
  renderAnalysis(signal);
  renderHistory();
  
  // Switch to signal tab
  switchTab('signal');
  
  btn.classList.remove('analyzing');
}

async function generateAllSignals() {
  const btn = document.getElementById('generate-all-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Scanning...';
  
  for (let i = 0; i < PAIRS.length; i++) {
    const pair = PAIRS[i];
    const signal = generateCompositeSignal(pair, currentTimeframe);
    pairSignalStates[pair.symbol] = signal.direction.toLowerCase();
    signalHistory.unshift(signal);
    
    await sleep(100);
  }
  
  if (signalHistory.length > 100) signalHistory = signalHistory.slice(0, 100);
  
  renderPairsList(document.getElementById('pair-search').value);
  renderHistory();
  switchTab('history');
  
  btn.disabled = false;
  btn.textContent = '🔄 Scan All';
}

function renderSignal(signal) {
  const container = document.getElementById('signal-result');
  const emptyEl = document.getElementById('empty-signal');
  emptyEl.style.display = 'none';
  container.style.display = 'block';
  
  const dirClass = signal.direction === 'CALL' ? 'call' : 'put';
  const dirIcon = signal.direction === 'CALL' ? '📈' : '📉';
  const confClass = signal.confidence >= 75 ? 'high' : signal.confidence >= 55 ? 'medium' : 'low';
  
  let patternsHTML = '';
  if (signal.patterns.length > 0) {
    patternsHTML = `
      <div class="patterns-section">
        <div class="section-title">🕯️ Detected Patterns</div>
        <div>
          ${signal.patterns.map(p => `
            <span class="pattern-tag ${p.type}">${p.icon} ${p.name}</span>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  let strategiesHTML = `
    <div class="strategies-section">
      <div class="section-title">📋 Strategy Analysis</div>
      ${signal.strategies.map(s => `
        <div class="strategy-item ${s.signal}">
          <div class="strategy-name">${s.name}</div>
          <div class="strategy-detail">${s.detail}</div>
          <div class="strategy-signal ${s.signal}">
            ${s.signal === 'bullish' ? '▲ CALL' : s.signal === 'bearish' ? '▼ PUT' : '● NEUTRAL'} — ${s.confidence}%
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = `
    <div class="signal-card ${dirClass}">
      <div class="signal-direction ${dirClass}">${dirIcon} ${signal.direction}</div>
      <div class="signal-pair-title">${signal.pair.name}</div>
      <div class="signal-time">
        ⏰ Entry: ${signal.entryTime} · ${signal.entryDate}
      </div>
      
      <div class="signal-metrics">
        <div class="metric-box">
          <div class="metric-label">Confidence</div>
          <div class="metric-value ${confClass}">${signal.confidence}%</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Strength</div>
          <div class="metric-value ${confClass}">${signal.strength.toUpperCase()}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Timeframe</div>
          <div class="metric-value">${signal.timeframe}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Expiry</div>
          <div class="metric-value">${signal.expiry}</div>
        </div>
      </div>
      
      <div class="confidence-bar-container">
        <div class="confidence-bar-label">
          <span>Signal Strength</span>
          <span>${signal.confidence}%</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-bar-fill ${confClass}" style="width: ${signal.confidence}%"></div>
        </div>
      </div>
      
      ${patternsHTML}
      ${strategiesHTML}
    </div>
  `;
}

function renderAnalysis(signal) {
  const container = document.getElementById('analysis-result');
  const emptyEl = document.getElementById('empty-analysis');
  emptyEl.style.display = 'none';
  container.style.display = 'block';
  
  const ind = signal.indicators;
  
  const rsiSignal = ind.rsi < 30 ? 'bullish' : ind.rsi > 70 ? 'bearish' : 'neutral';
  const macdSignal = ind.macd > 0 ? 'bullish' : ind.macd < 0 ? 'bearish' : 'neutral';
  const stochSignal = ind.stochK < 20 ? 'bullish' : ind.stochK > 80 ? 'bearish' : 'neutral';
  const bbPos = ind.price > ind.bbMiddle ? 'bullish' : 'bearish';
  const trendSignal = ind.price > ind.ema50 ? 'bullish' : 'bearish';
  
  container.innerHTML = `
    <div class="signal-card">
      <div class="section-title">📊 Technical Indicators</div>
      <div class="indicators-grid">
        <div class="indicator-row">
          <span class="indicator-name">RSI (14)</span>
          <span class="indicator-value ${rsiSignal}">${ind.rsi.toFixed(2)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">MACD Histogram</span>
          <span class="indicator-value ${macdSignal}">${ind.macd.toFixed(6)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">Stoch %K</span>
          <span class="indicator-value ${stochSignal}">${ind.stochK.toFixed(2)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">Stoch %D</span>
          <span class="indicator-value ${stochSignal}">${ind.stochD.toFixed(2)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">BB Upper</span>
          <span class="indicator-value">${ind.bbUpper.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">BB Middle</span>
          <span class="indicator-value">${ind.bbMiddle.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">BB Lower</span>
          <span class="indicator-value">${ind.bbLower.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">EMA 20</span>
          <span class="indicator-value ${ind.price > ind.ema20 ? 'bullish' : 'bearish'}">${ind.ema20.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">EMA 50</span>
          <span class="indicator-value ${trendSignal}">${ind.ema50.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">EMA 200</span>
          <span class="indicator-value ${ind.price > ind.ema200 ? 'bullish' : 'bearish'}">${ind.ema200.toFixed(5)}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">Current Price</span>
          <span class="indicator-value">${ind.price.toFixed(5)}</span>
        </div>
      </div>
    </div>
    
    <div class="signal-card">
      <div class="section-title">📈 Market Context</div>
      <div class="indicators-grid">
        <div class="indicator-row">
          <span class="indicator-name">Trend</span>
          <span class="indicator-value ${trendSignal}">${trendSignal === 'bullish' ? '▲ BULLISH' : '▼ BEARISH'}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">BB Position</span>
          <span class="indicator-value ${bbPos}">${bbPos === 'bullish' ? 'Above Mid' : 'Below Mid'}</span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">RSI Zone</span>
          <span class="indicator-value ${rsiSignal}">
            ${ind.rsi < 30 ? 'Oversold' : ind.rsi > 70 ? 'Overbought' : 'Neutral'}
          </span>
        </div>
        <div class="indicator-row">
          <span class="indicator-name">Stoch Zone</span>
          <span class="indicator-value ${stochSignal}">
            ${ind.stochK < 20 ? 'Oversold' : ind.stochK > 80 ? 'Overbought' : 'Neutral'}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderHistory() {
  const table = document.getElementById('history-table');
  const emptyEl = document.getElementById('empty-history');
  const body = document.getElementById('history-body');
  
  if (signalHistory.length === 0) {
    table.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }
  
  emptyEl.style.display = 'none';
  table.style.display = 'table';
  
  body.innerHTML = signalHistory.map(s => `
    <tr>
      <td style="font-weight:600; color: var(--text-primary);">${s.pair.name}</td>
      <td><span class="history-dir ${s.direction.toLowerCase()}">${s.direction}</span></td>
      <td style="font-family: 'JetBrains Mono', monospace; color: ${
        s.confidence >= 75 ? 'var(--call-green)' : s.confidence >= 55 ? 'var(--warning)' : 'var(--put-red)'
      };">${s.confidence}%</td>
      <td style="font-family: 'JetBrains Mono', monospace;">${s.entryTime}</td>
    </tr>
  `).join('');
}

// ===== Utility =====
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
