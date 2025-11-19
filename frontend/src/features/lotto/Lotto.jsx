import { useMemo, useState } from 'react';
import {
  TICKET_PRICE,
  RANKS,
  generateTickets,
  parseWinningNumbers,
  parseBonusNumber,
  evaluateTickets,
} from './lottoCore';
import './Lotto.css';

const DEFAULT_WINNING_NUMBERS = ['1', '5', '7', '26', '28', '43'];
const DEFAULT_BONUS_NUMBER = '30';
const TOTAL_STEPS = 4;

const NUMBER_COLORS = ['yellow', 'orange', 'blue', 'red', 'green', 'gray'];

const formatCurrency = (value) =>
  `${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} 원`;

function Lotto() {
  const [amount, setAmount] = useState('8000');
  const [winningNumbers, setWinningNumbers] = useState(DEFAULT_WINNING_NUMBERS);
  const [bonusNumber, setBonusNumber] = useState(DEFAULT_BONUS_NUMBER);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [step, setStep] = useState(0);
  const [purchaseError, setPurchaseError] = useState('');
  const [resultError, setResultError] = useState('');

  const ticketCount = useMemo(() => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return 0;
    }
    return Math.floor(numericAmount / TICKET_PRICE);
  }, [amount]);

  const handleNumberChange = (index, value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setWinningNumbers((prev) =>
      prev.map((prevValue, idx) => (idx === index ? sanitized : prevValue))
    );
  };

  const handleBonusChange = (value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBonusNumber(sanitized);
  };

  const handlePurchase = (event) => {
    event.preventDefault();
    try {
      const numericAmount = Number(amount);
      const generatedTickets = generateTickets(numericAmount);
      setTickets(generatedTickets);
      setStats(null);
      setStep(1);
      setPurchaseError('');
    } catch (submissionError) {
      setPurchaseError(submissionError.message);
      setStep(0);
    }
  };

  const handleShowResult = (event) => {
    event.preventDefault();
    if (tickets.length === 0) {
      setResultError('먼저 로또를 발행해 주세요.');
      return;
    }
    try {
      const normalizedWinning = parseWinningNumbers(winningNumbers);
      const normalizedBonus = parseBonusNumber(bonusNumber, normalizedWinning);
      const evaluation = evaluateTickets(
        tickets,
        normalizedWinning,
        normalizedBonus
      );
      setStats(evaluation);
      setStep(3);
      setResultError('');
    } catch (submissionError) {
      setResultError(submissionError.message);
    }
  };

  const goToStep = (nextStep) => {
    if (nextStep < 0 || nextStep >= TOTAL_STEPS) {
      return;
    }
    if (nextStep > 1 && tickets.length === 0) {
      return;
    }
    if (nextStep === 3 && !stats) {
      return;
    }
    setStep(nextStep);
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <form className="lotto__form" onSubmit={handlePurchase}>
          <h2 className="lotto__title">로또</h2>

          <label className="lotto__label" htmlFor="lotto-amount">
            구입금액을 입력하세요 (1000원당 1장)
          </label>
          <div className="lotto__amount-field">
            <input
              id="lotto-amount"
              className="lotto__amount-input"
              type="number"
              min={TICKET_PRICE}
              step={TICKET_PRICE}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="lotto__amount-suffix">원</span>
          </div>
          <p className="lotto__hint">
            현재 입력 금액으로는 총{' '}
            <strong>{ticketCount.toLocaleString('ko-KR')}</strong>장의 로또를
            발행해요.
          </p>

          <button type="submit" className="lotto__primary">
            로또 발행
          </button>

          {purchaseError && (
            <p className="lotto__error" role="alert">
              {purchaseError}
            </p>
          )}
        </form>
      );
    }

    if (step === 1) {
      return (
        <section className="lotto__panel">
          <h2 className="lotto__title">로또</h2>
          <ul className="lotto__ticket-list">
            {tickets.map((ticket, index) => (
              <li key={`${ticket.join('-')}-${index}`}>
                <span className="lotto__ticket-label">
                  자동 {String(index + 1).padStart(2, '0')}
                </span>
                <span className="lotto__ticket-numbers">
                  {ticket
                    .map((number) => String(number).padStart(2, '0'))
                    .join(' ')}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="lotto__primary lotto__primary--inline"
            onClick={() => goToStep(2)}
          >
            당첨 번호 입력하기
          </button>
        </section>
      );
    }

    if (step === 2) {
      return (
        <form className="lotto__form" onSubmit={handleShowResult}>
          <h2 className="lotto__title">당첨 번호 입력</h2>
          <p className="lotto__label">당첨 번호를 입력하세요</p>
          <div className="lotto__numbers">
            {winningNumbers.map((value, index) => (
              <input
                key={index}
                type="number"
                min="1"
                max="45"
                className={`lotto-number lotto-number--${NUMBER_COLORS[index]}`}
                value={value}
                onChange={(event) =>
                  handleNumberChange(index, event.target.value)
                }
              />
            ))}

            <span className="lotto-number lotto-number--plus">+</span>

            <input
              type="number"
              min="1"
              max="45"
              className="lotto-number lotto-number--bonus"
              value={bonusNumber}
              onChange={(event) => handleBonusChange(event.target.value)}
            />
          </div>

          <button type="submit" className="lotto__primary">
            결과 확인
          </button>

          {resultError && (
            <p className="lotto__error" role="alert">
              {resultError}
            </p>
          )}
        </form>
      );
    }

    if (step === 3 && stats) {
      return (
        <section className="lotto__panel">
          <h2 className="lotto__title">결과</h2>

          <ul className="lotto__result-list">
            {RANKS.map((rank) => (
              <li key={rank.id}>
                <span className="lotto__result-label">
                  {rank.label} -{' '}
                  {rank.matches === 5 && rank.requiresBonus === true
                    ? '5개 + 보너스'
                    : `${rank.matches}개`}
                </span>
                <span className="lotto__result-count">
                  {stats.counts[rank.id] ?? 0}개
                </span>
              </li>
            ))}
          </ul>

          <div className="lotto__result-summary">
            <p>총 상금: {formatCurrency(stats.totalPrize)}</p>
            <p>수익률: {stats.profitRate}%</p>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="lotto">
      <div className="lotto__content">{renderStepContent()}</div>

      <div className="lotto__nav">
        <button
          type="button"
          className="lotto__nav-button"
          aria-label="이전 단계"
          onClick={() => goToStep(step - 1)}
          disabled={step === 0}
        >
          <span className="lotto__nav-icon lotto__nav-icon--prev" />
        </button>

        <button
          type="button"
          className="lotto__nav-button"
          aria-label="다음 단계"
          onClick={() => goToStep(step + 1)}
          disabled={
            step === TOTAL_STEPS - 1 ||
            (step === 0 && tickets.length === 0) ||
            (step === 1 && tickets.length === 0) ||
            (step === 2 && !stats)
          }
        >
          <span className="lotto__nav-icon lotto__nav-icon--next" />
        </button>
      </div>
    </div>
  );
}

export default Lotto;
