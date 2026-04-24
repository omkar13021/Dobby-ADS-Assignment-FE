import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, Spin, message, Dropdown, Modal, Row, Col } from 'antd';
import { FolderOutlined, FileImageOutlined, PlusOutlined, UploadOutlined, ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import Breadcrumb from './Breadcrumb';
import CreateFolderModal from './CreateFolderModal';
import UploadModal from './UploadModal';

const FolderView = ({ userId }) => {
    const [currentPath, setCurrentPath] = useState([]);
    const [folders, setFolders] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : null;

    const fetchContents = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const folderData = await apiService.folder.getTree(userId);
            const imageData = currentFolderId 
                ? await apiService.image.getByFolder(currentFolderId)
                : [];
            
            // Find subfolders of current folder
            const subFolders = currentFolderId
                ? folderData.filter(folder => folder.parentId === currentFolderId)
                : folderData.filter(folder => !folder.parentId);
            
            setFolders(subFolders);
            setImages(imageData);
        } catch (error) {
            message.error('Failed to load contents');
        } finally {
            setLoading(false);
        }
    }, [userId, currentFolderId]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const handleFolderClick = (folder) => {
        setCurrentPath([...currentPath, folder]);
    };

    const handleBreadcrumbClick = (index) => {
        setCurrentPath(currentPath.slice(0, index + 1));
    };

    const handleCreateFolder = async (name) => {
        try {
            await apiService.folder.create(name, currentFolderId, userId);
            message.success('Folder created');
            setCreateModalOpen(false);
            fetchContents();
        } catch (error) {
            message.error('Failed to create folder');
        }
    };

    const handleUpload = async (file) => {
        try {
            if (!currentFolderId) {
                message.error('Please select a folder first');
                return;
            }
            await apiService.image.upload(file, currentFolderId, userId);
            message.success(`${file.name} uploaded successfully`);
            setUploadModalOpen(false);
            fetchContents();
        } catch (error) {
            message.error(`Failed to upload ${file.name}`);
        }
    };

    const handleDeleteFolder = async (folder) => {
        Modal.confirm({
            title: 'Delete Folder',
            content: `Are you sure you want to delete "${folder.name}"? This will delete all nested folders and images.`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await apiService.folder.delete(folder._id);
                    message.success('Folder deleted');
                    fetchContents();
                } catch (error) {
                    message.error('Failed to delete folder');
                }
            }
        });
    };

    const handleDeleteImage = async (image) => {
        Modal.confirm({
            title: 'Delete Image',
            content: `Are you sure you want to delete "${image.name}"?`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await apiService.image.delete(image._id);
                    message.success('Image deleted');
                    fetchContents();
                } catch (error) {
                    message.error('Failed to delete image');
                }
            }
        });
    };

    const getFolderMenu = (folder) => ({
        items: [
            {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteFolder(folder)
            }
        ]
    });

    const getImageMenu = (image) => ({
        items: [
            {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteImage(image)
            }
        ]
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Breadcrumb 
                    path={currentPath} 
                    onNavigate={handleBreadcrumbClick}
                />
                <div className="flex gap-2">
                    <Button 
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        New Folder
                    </Button>
                    <Button 
                        icon={<UploadOutlined />}
                        onClick={() => setUploadModalOpen(true)}
                        disabled={!currentFolderId}
                    >
                        Upload
                    </Button>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {folders.map(folder => (
                    <Col xs={12} sm={8} md={6} lg={4} key={folder._id}>
                        <Card
                            hoverable
                            onClick={() => handleFolderClick(folder)}
                            className="folder-card relative"
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="flex flex-col items-center text-center">
                                <FolderOutlined className="text-5xl text-blue-500 mb-3" />
                                <div className="font-medium text-sm truncate w-full">{folder.name}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {folder.size > 0 ? `${folder.size} bytes` : 'Empty'}
                                </div>
                            </div>
                            <Dropdown menu={getFolderMenu(folder)} trigger={['contextMenu']}>
                                <Button 
                                    type="text" 
                                    icon={<MoreOutlined />}
                                    className="absolute top-2 right-2 opacity-0 hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </Card>
                    </Col>
                ))}

                {images.map(image => (
                    <Col xs={12} sm={8} md={6} lg={4} key={image._id}>
                        <Card
                            hoverable
                            cover={
                                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <FileImageOutlined className="text-5xl text-gray-400" />
                                </div>
                            }
                            className="image-card relative"
                            bodyStyle={{ padding: '12px' }}
                        >
                            <div className="truncate text-sm font-medium">{image.name}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {(image.size / 1024).toFixed(1)} KB
                            </div>
                            <Dropdown menu={getImageMenu(image)} trigger={['contextMenu']}>
                                <Button 
                                    type="text" 
                                    icon={<MoreOutlined />}
                                    className="absolute top-2 right-2 opacity-0 hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </Card>
                    </Col>
                ))}
            </Row>

            {folders.length === 0 && images.length === 0 && (
                <Empty 
                    description={currentFolderId ? 'This folder is empty' : 'No folders yet'}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}

            <CreateFolderModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateFolder}
            />

            <UploadModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    );
};

export default FolderView;
