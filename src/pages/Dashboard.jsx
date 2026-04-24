import { Layout, Typography, Card, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import FolderView from '../components/FolderView';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <Layout className="min-h-screen bg-gray-50">
            <Header className="flex items-center justify-between bg-white shadow-sm px-6">
                <Title level={3} className="m-0 text-blue-600">
                    Folder Manager
                </Title>
                <div className="flex items-center gap-4">
                    <Text className="text-gray-600">
                        Welcome, {user?.name}
                    </Text>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </Header>

            <Content className="p-6">
                <FolderView userId={user?.id} />

            </Content>
        </Layout>
    );
};

export default Dashboard;
