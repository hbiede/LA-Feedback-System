class Services {
    static authenticate = (username: string, password: string): boolean => true;

    static sendEmail = (email: string): boolean => {
      let successStatus = false;
      // Services.mailer.sendMail('hbiede@gmail.com', 'Seeking LA Feedback', 'Howdy')
      //   .then((r) => {
      //     successStatus = r.valueOf();
      //   });
      return successStatus;
    }
}

export default Services;
