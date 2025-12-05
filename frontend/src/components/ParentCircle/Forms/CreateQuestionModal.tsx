/**
 * ============================================
 * CREATE QUESTION MODAL
 * ============================================
 * @version     2.0.0
 * @author      ArogoClin
 * @updated     2025-12-05
 * @description Clean, professional question creation form
 * ============================================
 */

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Category } from '../../../types/parentcircle.types';
import * as API from '../../../services/parentcircle.service';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 0,
    tags: '',
    isAnonymous: false,
    authorName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories for questions
  const questionCategories = categories.filter(
    cat => cat.type === 'QUESTION' || cat.type === 'BOTH'
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim() || formData.content.trim(). length < 20) {
      newErrors.content = 'Question must be at least 20 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (formData.isAnonymous && !formData. authorName. trim()) {
      newErrors. authorName = 'Please provide a display name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...(formData.title.trim() && { title: formData.title.trim() }),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && 
          formData.authorName.trim() && 
          { authorName: formData.authorName.trim() })
      };

      await API.createQuestion(payload);

      toast.success('Question submitted successfully!  It will appear after moderation.');

      // Reset form
      setFormData({
        title: '',
        content: '',
        categoryId: 0,
        tags: '',
        isAnonymous: false,
        authorName: ''
      });
      setErrors({});

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (! submitting) {
      setFormData({
        title: '',
        content: '',
        categoryId: 0,
        tags: '',
        isAnonymous: false,
        authorName: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Ask a Question
                    </Dialog. Title>
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Get support and advice from our community
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                      className={`w-full px-4 py-2. 5 rounded-lg border ${
                        errors.categoryId ?  'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all`}
                      required
                    >
                      <option value={0}>Select a category... </option>
                      {questionCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-600 text-xs mt-1">{errors.categoryId}</p>
                    )}
                  </div>

                  {/* Title (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Title <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of your question"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.title. length}/200
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Describe your situation in detail.  What have you tried?  What specific help are you looking for?"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all min-h-[120px] resize-none`}
                      required
                    />
                    {errors.content && (
                      <p className="text-red-600 text-xs mt-1">{errors.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData. content.length} characters (min.  20)
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tags <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="sleep, toddler, nighttime"
                      className="w-full px-4 py-2. 5 rounded-lg border border-gray-300 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate with commas
                    </p>
                  </div>

                  {/* Anonymous Option */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData. isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded text-teal focus:ring-2 focus:ring-teal/20"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Post anonymously
                        </span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Your identity will be hidden from the community
                        </p>
                      </div>
                    </label>

                    {formData.isAnonymous && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pl-7"
                      >
                        <input
                          type="text"
                          value={formData. authorName}
                          onChange={(e) => setFormData({ ... formData, authorName: e. target.value })}
                          placeholder="Display name (e.g., Concerned Parent)"
                          className={`w-full px-3 py-2 rounded-lg border ${
                            errors.authorName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          } focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none transition-all text-sm`}
                          maxLength={50}
                        />
                        {errors.authorName && (
                          <p className="text-red-600 text-xs mt-1">{errors.authorName}</p>
                        )}
                      </motion. div>
                    )}
                  </div>

                  {/* Guidelines */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Posting Guidelines
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1. 5">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>Be specific about your situation and what you need help with</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>Mention what you've already tried</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>Be respectful and kind to all members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>All questions are reviewed before posting</span>
                      </li>
                    </ul>
                  </div>
                </form>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2. 5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-white transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-teal text-white font-semibold hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        <span>Post Question</span>
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateQuestionModal;