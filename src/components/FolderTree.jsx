import { Tree, Spin, Empty, message, Modal } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import FolderNode from './FolderNode';
import FolderModal from './FolderModal';
import UploadModal from './UploadModal';
import apiService from '../services/apiService';

const { confirm } = Modal;

const FolderTree = ({ userId }) => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState([]);
    
    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [folderModalMode, setFolderModalMode] = useState('create');
    const [folderModalLoading, setFolderModalLoading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    const fetchTree = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await apiService.folder.getTree(userId);
            setTreeData(data);
        } catch (error) {
            message.error('Failed to load folders');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchTree();
    }, [fetchTree]);

    const convertToTreeData = (nodes) => {
        return nodes.map(node => ({
            key: node._id,
            title: (
                <FolderNode
                    node={node}
                    isExpanded={expandedKeys.includes(node._id)}
                    onCreateFolder={handleCreateFolderClick}
                    onRenameFolder={handleRenameFolderClick}
                    onDeleteFolder={handleDeleteFolderClick}
                    onUploadImage={handleUploadClick}
                />
            ),
            children: node.children?.length > 0 ? convertToTreeData(node.children) : undefined
        }));
    };

    const handleCreateFolderClick = (parentFolder) => {
        setSelectedFolder(parentFolder);
        setFolderModalMode('create');
        setFolderModalOpen(true);
    };

    const handleRenameFolderClick = (folder) => {
        setSelectedFolder(folder);
        setFolderModalMode('rename');
        setFolderModalOpen(true);
    };

    const handleDeleteFolderClick = (folder) => {
        confirm({
            title: 'Delete Folder',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete "${folder.name}"? This will delete all nested folders and images.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiService.folder.delete(folder._id);
                    message.success('Folder deleted');
                    fetchTree();
                } catch (error) {
                    message.error('Failed to delete folder');
                }
            }
        });
    };

    const handleUploadClick = (folder) => {
        setSelectedFolder(folder);
        setUploadModalOpen(true);
    };

    const handleFolderModalSubmit = async (name) => {
        setFolderModalLoading(true);
        try {
            if (folderModalMode === 'create') {
                await apiService.folder.create(name, selectedFolder?._id || null, userId);
                message.success('Folder created');
            } else {
                await apiService.folder.rename(selectedFolder._id, name);
                message.success('Folder renamed');
            }
            setFolderModalOpen(false);
            fetchTree();
        } catch (error) {
            message.error(`Failed to ${folderModalMode} folder`);
        } finally {
            setFolderModalLoading(false);
        }
    };

    const handleUpload = async (file) => {
        setUploadLoading(true);
        try {
            await apiService.image.upload(file, selectedFolder._id, userId);
            message.success(`${file.name} uploaded successfully`);
            setUploadModalOpen(false);
            fetchTree();
        } catch (error) {
            message.error(`Failed to upload ${file.name}`);
            throw error;
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCreateRootFolder = () => {
        setSelectedFolder(null);
        setFolderModalMode('create');
        setFolderModalOpen(true);
    };

    if (loading && treeData.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <button
                    onClick={handleCreateRootFolder}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    + New Root Folder
                </button>
            </div>

            {treeData.length === 0 ? (
                <Empty 
                    description="No folders yet. Create your first folder!" 
                    className="mt-8"
                />
            ) : (
                <Tree
                    treeData={convertToTreeData(treeData)}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    showLine={{ showLeafIcon: false }}
                    blockNode
                />
            )}

            <FolderModal
                open={folderModalOpen}
                onCancel={() => setFolderModalOpen(false)}
                onSubmit={handleFolderModalSubmit}
                loading={folderModalLoading}
                mode={folderModalMode}
                initialName={selectedFolder?.name || ''}
            />

            <UploadModal
                open={uploadModalOpen}
                onCancel={() => setUploadModalOpen(false)}
                onUpload={handleUpload}
                loading={uploadLoading}
                folderName={selectedFolder?.name}
            />
        </div>
    );
};

export default FolderTree;
