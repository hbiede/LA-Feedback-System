class Services {
  static authenticate = (username: string, password: string): boolean => true;

  static sendEmail = async (studentCSE: string, laCSE: string): Promise<string|null> => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCSE, laCSE }),
    };
    let status = null;
    await fetch(`${process.env.PUBLIC_URL}/sendEmail.php`, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        status = body.message;
      });
    return status;
  }
}

export default Services;
