import { useState } from 'react';
import { Layout, Typography, Input, Card, message } from 'antd';
import FolderTree from './components/FolderTree';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [userId, setUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');

  const handleSetUser = () => {
    if (!userId.trim()) {
      message.warning('Please enter a User ID');
      return;
    }
    setActiveUserId(userId.trim());
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="flex items-center bg-white shadow-sm px-6">
        <Title level={3} className="m-0 text-blue-600">
          Folder Manager
        </Title>
      </Header>
      
      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Enter User ID (MongoDB ObjectId)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onPressEnter={handleSetUser}
                className="max-w-md"
              />
              <button
                onClick={handleSetUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Load Folders
              </button>
            </div>
            {activeUserId && (
              <p className="mt-2 text-gray-500 text-sm">
                Active User: {activeUserId}
              </p>
            )}
          </Card>

          {activeUserId ? (
            <Card title="Folder Structure">
              <FolderTree userId={activeUserId} />
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>Enter a User ID to view and manage folders</p>
                <p className="text-sm mt-2">
                  Tip: Right-click on folders for actions (create, rename, delete, upload)
                </p>
              </div>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
