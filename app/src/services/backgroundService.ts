class Services {
    static authenticate = (username: string, password: string): boolean => true;

    static sendEmail = async (email: string, laCSE: string): Promise<number> => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, laCSE }),
      };
      let statusCode = -1;
      await fetch(`${process.env.PUBLIC_URL}/sendEmail.php`, requestOptions).then((response) => {
        statusCode = response.status;
      });
      console.log(statusCode);
      return statusCode;
    }
}

export default Services;
