class Services {
  static isLA = (username: string): boolean => true;

  static sendEmail = async (studentCSE: string, laCSE: string, course: string): Promise<string|null> => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentCSE, laCSE, course }),
    };
    let status = null;
    await fetch(`${process.env.PUBLIC_URL}/sendEmail.php`, requestOptions)
      .then((response) => response.json())
      .then((body) => {
        status = body.message;
      });
    return status;
  }

  static getPath = () => window.location.href.split('?')[0];
}

export default Services;
