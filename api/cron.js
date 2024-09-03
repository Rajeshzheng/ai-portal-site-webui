// api/cron.js
export default function handler(req, res) {
    // 验证请求方法
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 验证 Authorization 头
    const authKey = process.env.AUTH_KEY; // 从环境变量获取 auth_key
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || authorizationHeader !== `Bearer ${authKey}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // 这里编写你想要定期执行的任务逻辑
    console.log('Cron job executed');

    return res.status(200).json({ message: 'Cron job executed successfully!' });
}
