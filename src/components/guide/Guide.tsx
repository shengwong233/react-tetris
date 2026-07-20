import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { i18n, lan } from '@/i18n';

function isMobile() {
  const ua = navigator.userAgent;
  return (
    /Android (\d+\.\d+)/.test(ua) ||
    ua.indexOf('iPhone') > -1 ||
    ua.indexOf('iPod') > -1 ||
    ua.indexOf('iPad') > -1 ||
    ua.indexOf('NokiaN') > -1
  );
}

export function Guide() {
  const [mobile] = useState(() => isMobile());
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (mobile) return;
    QRCode.toDataURL(location.href, { margin: 1 }).then(setQr);
  }, [mobile]);

  if (mobile) return null;

  return (
    <div>
      <div className="guide right">
        <div className="up">
          <em style={{ transform: 'translate(0,-3px) scale(1,2)' }} />
        </div>
        <div className="left">
          <em style={{ transform: 'translate(-7px,3px) rotate(-90deg) scale(1,2)' }} />
        </div>
        <div className="down">
          <em style={{ transform: 'translate(0,9px) rotate(180deg) scale(1,2)' }} />
        </div>
        <div className="right">
          <em style={{ transform: 'translate(7px,3px) rotate(90deg) scale(1,2)' }} />
        </div>
      </div>
      <div className="guide left">
        <p>
          <a
            href="https://github.com/chvin/react-tetris"
            rel="noopener noreferrer"
            target="_blank"
            title={i18n.linkTitle[lan]}
          >
            {`${i18n.github[lan]}:`}
          </a>
          <br />
          <iframe
            src="https://ghbtns.com/github-btn.html?user=chvin&repo=react-tetris&type=star&count=true"
            frameBorder={0}
            scrolling="0"
            width="170px"
            height="20px"
            style={{ transform: 'scale(1.68)', transformOrigin: 'center left' }}
          />
          <br />
          <iframe
            src="https://ghbtns.com/github-btn.html?user=chvin&repo=react-tetris&type=fork&count=true"
            frameBorder={0}
            scrolling="0"
            width="170px"
            height="20px"
            style={{ transform: 'scale(1.68)', transformOrigin: 'center left' }}
          />
        </p>
        <div className="space">SPACE</div>
      </div>
      {qr ? (
        <div className="guide qr">
          <img src={qr} alt={i18n.QRCode[lan]} />
        </div>
      ) : null}
    </div>
  );
}
