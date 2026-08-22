import { Tour } from 'nextstepjs';

const steps: Tour[] = [
  {
    tour: 'TransactTour',
    steps: [
      {
        icon: <>👋</>,
        title: 'Welcome to Temporal',
        content: (
          <p>
            Let us show you how to Trade Perp Bands on Temporal.
            <br />
          </p>
        ),
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Trade Bands Tab',
        content: (
          <p>The only tab you need for this Alpha version</p>
        ),
        selector: '#tour1-step2-trade-bands',
        side: 'bottom-left',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Sell Box Overview',
        content: (
          <p>Choose how much upside you&apos;ll sell to buy protection. We&apos;ll set size and prices next.</p>
        ),
        selector: '#tour1-step3-sell-box',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Sell Box QTY',
        content: (
          <p>Have 2 BTC long perps on Drift? Enter 2 and select BTC Perp Long.</p>
        ),
        selector: '#tour1-step4-sell-qty',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Sell Box Price Band',
        content: (
          <p>Set where you&apos;re ok giving up upside. Example: $120k &ndash; $150k.</p>
        ),
        selector: '#tour1-step5-sell-price',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Pink Band',
        content: (
          <p>Pink = the window where you&apos;re selling upside for protection.</p>
        ),
        selector: '#tour1-step6-graph',
        side: 'left',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Profits Overview',
        content: (
          <p>Tell us the downside you want covered.</p>
        ),
        selector: '#tour1-step7-buy-box',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Profits Price Band',
        content: (
          <p>Example: $80k &ndash; $70k.</p>
        ),
        selector: '#tour1-step8-buy-price',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Profits QTY (Automatic)',
        content: (
          <p>Auto-filled. Based on your deposit and bands, the AMM covers ≈ X BTC.</p>
        ),
        selector: '#tour1-step9-buy-qty',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Blue Band',
        content: (
          <p>Blue = your protection zone.</p>
        ),
        selector: '#tour1-step6-graph',
        side: 'left',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Info Panel (Costs)',
        content: (
          <p>Total cost: slippage + fees. Give it a quick check.</p>
        ),
        selector: '#tour1-step10-info-box',
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Transact Button',
        content: (
          <p>All set. Click Transact.</p>
        ),
        selector: '#tour1-step11-transact-button',
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: "You're ready to Trade Perp Bands",
        content: (
          <p>Need help? DM @GTShu on Telegram.</p>
        ),
        side: 'top',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
    ],
  },
  {
    tour: 'TransactPanelTour',
    steps: [
      {
        icon: <>👋</>,
        title: 'tAsset',
        content: (
          <p>
            The base asset [e.g. tUSD, tEUR, …] is a synthetic auto-compounding overnight interest rate index asset.
            <br />
          </p>
        ),
        side: 'right',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
      {
        icon: <></>,
        title: 'Connect your wallet',
        content: (
          <p>You need to connect your wallet before you can use the platform</p>
        ),
        selector: '#tour1-step2',
        side: 'bottom-left',
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },
    ],
  },
];

export default steps;