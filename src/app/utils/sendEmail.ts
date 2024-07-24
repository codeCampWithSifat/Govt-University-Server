import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production', // Use `true` for port 465, `false` for all other ports
    auth: {
      user: 'sayedhossainshifat706@gmail.com',
      pass: 'ezrh xioo opeq gpio',
    },
  });

  await transporter.sendMail({
    from: 'sayedhossainshifat706@gmail.com', // sender address
    to,
    subject:
      'Change Your Password Within 10 Minitues. After 10 Minitues This Link Will Be Invalided', // Subject line
    text: '', // plain text body
    html, // html body
  });

  //   console.log('Message sent: %s', info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};
