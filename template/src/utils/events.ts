declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

type Payload = {
  autopayments: 1 | 0;
  limit: 1 | 0;
  limit_sum: number;
  insurance: 1 | 0;
  email: 1 | 0;
};

export const sendDataToGA = async (payload: Payload) => {
  try {
    const now = new Date();
    const date = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    await fetch(
      'https://script.google.com/macros/s/AKfycby5o6NHvbauTAj8l86WU7W7V8JuXwTtnUAFPlo5ZPWsoEQXsk3I8MaBpkia6uoNT0RW/exec',
      {
        redirect: 'follow',
        method: 'POST',
        body: JSON.stringify({ date, ...payload, variant: 'variant1' }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Error!', error);
  }
};
