import { Button } from '@alfalab/core-components/button/cssm';
import { Gap } from '@alfalab/core-components/gap/cssm';
import { Typography } from '@alfalab/core-components/typography/cssm';
import { useEffect, useState } from 'react';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import { sendDataToGA } from './utils/events';

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState('');
  const [thxShow, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }
  }, []);

  const submit = () => {
    if (!accountNumber) {
      setError('Укажите номер лицевого счёта');
      return;
    }
    setLoading(true);

    sendDataToGA({
      autopayments: Number(checked) as 1 | 0,
      limit: Number(checked2) as 1 | 0,
      limit_sum: limit ?? 0,
      insurance: Number(checked3) as 1 | 0,
      email: email ? 1 : 0,
    }).then(() => {
      LS.setItem(LSKeys.ShowThx, true);
      setThx(true);
      setLoading(false);
    });
  };

  if (thxShow) {
    return <ThxLayout />;
  }

  return (
    <>
      <div className={appSt.container}>
        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h1" view="small" font="system" weight="semibold">
          Оплата ЖКУ
        </Typography.TitleResponsive>
      </div>
      <Gap size={96} />

      <div className={appSt.bottomBtn}>
        <Button loading={loading} block view="primary" onClick={submit} hint={err}>
          Создать шаблон оплаты
        </Button>
      </div>
    </>
  );
};
