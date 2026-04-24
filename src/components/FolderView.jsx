import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, Spin, message, Dropdown, Modal, Row, Col } from 'antd';
import { FolderOutlined, PlusOutlined, UploadOutlined, ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
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
            // Fetch contents of current folder (folders + images)
            const contents = await apiService.folder.getContents(userId, currentFolderId);
            
            setFolders(contents.folders || []);
            setImages(contents.images || []);
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
        if (index < 0) {
            // Go to Home
            setCurrentPath([]);
        } else {
            setCurrentPath(currentPath.slice(0, index + 1));
        }
    };

    const handleGoBack = () => {
        if (currentPath.length > 0) {
            setCurrentPath(currentPath.slice(0, -1));
        }
    };

    const handleCreateFolder = async (name) => {
        try {
            // Optimistic update - create temporary folder
            const tempId = `temp-${Date.now()}`;
            const tempFolder = {
                _id: tempId,
                name,
                parentId: currentFolderId,
                userId,
                size: 0,
                createdAt: new Date().toISOString(),
                isTemp: true
            };

            // Update UI immediately
            setFolders(prev => [...prev, tempFolder]);

            // Create folder on backend
            const newFolder = await apiService.folder.create(name, currentFolderId, userId);
            
            // Replace temp folder with real one
            setFolders(prev => prev.map(f => f._id === tempId ? newFolder : f));
            
            message.success('Folder created');
            setCreateModalOpen(false);
        } catch (error) {
            // Remove temp folder on error
            setFolders(prev => prev.filter(f => !f.isTemp));
            message.error(error.message || 'Failed to create folder');
        }
    };

    const handleUpload = async (file) => {
        try {
            if (!currentFolderId) {
                message.error('Please select a folder first');
                return;
            }

            // Optimistic update - create temporary image
            const tempId = `temp-${Date.now()}`;
            const tempImage = {
                _id: tempId,
                name: file.name,
                url: URL.createObjectURL(file),
                size: file.size,
                folderId: currentFolderId,
                isTemp: true
            };

            // Update UI immediately
            setImages(prev => [...prev, tempImage]);

            // Upload to backend
            const response = await apiService.image.upload(file, currentFolderId, userId);
            
            // Replace temp image with real one
            setImages(prev => prev.map(img => 
                img._id === tempId ? response.image : img
            ));
            
            message.success(`${file.name} uploaded successfully`);
            setUploadModalOpen(false);
            
            // Refresh to update folder sizes
            fetchContents();
        } catch (error) {
            // Remove temp image on error
            setImages(prev => prev.filter(img => !img.isTemp));
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
                key: 'open',
                label: 'Open',
                onClick: () => handleFolderClick(folder)
            },
            {
                type: 'divider'
            },
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
                <div className="flex items-center gap-3">
                    {currentPath.length > 0 && (
                        <Button 
                            icon={<ArrowLeftOutlined />}
                            onClick={handleGoBack}
                        />
                    )}
                    <Breadcrumb 
                        path={currentPath} 
                        onNavigate={handleBreadcrumbClick}
                    />
                </div>
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

                {images.map(image => {
                    const imageUrl = image.url?.startsWith('blob:') 
                        ? image.url 
                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image.url}`;
                    
                    return (
                        <Col xs={12} sm={8} md={6} lg={4} key={image._id}>
                            <Card
                                hoverable
                                cover={
                                    <div className="h-32 bg-gray-100 overflow-hidden flex items-center justify-center">
                                        <img 
                                            src={imageUrl} 
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="text-gray-400" style="width: 48px; height: 48px;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                                            }}
                                        />
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
                                        className="absolute top-2 right-2 opacity-0 hover:opacity-100 bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Dropdown>
                            </Card>
                        </Col>
                    );
                })}
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
