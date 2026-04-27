/**
 * ============================================
 * CREATE QUESTION MODAL — PARENTCIRCLE
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 * @description Headless UI Dialog version with brand styling
 * ============================================
 */

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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

// ─── SHARED FIELD STYLES ─────────────────────────────────────────────────────

const fieldClass = (hasError?: boolean) =>
  `w-full px-4 py-3 bg-[#fbfbfb] border rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-[#1e3a6e]/12 focus:border-[#e9924b]/50 focus:ring-[#e9924b]/8'
  }`;

const labelClass = 'block text-xs font-semibold text-[#1e3a6e]/60 mb-2';

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen, onClose, categories, onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 0,
    tags: '',
    isAnonymous: true,
    authorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questionCategories = categories.filter(c => c.type === 'QUESTION' || c.type === 'BOTH');

  const set = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.content.trim() || formData.content.trim().length < 20)
      e.content = 'Please write at least 20 characters';
    if (!formData.categoryId)
      e.categoryId = 'Please select a category';
    if (formData.isAnonymous && !formData.authorName.trim())
      e.authorName = 'Please provide a display name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }
    try {
      setSubmitting(true);
      await API.createQuestion({
        ...(formData.title.trim() && { title: formData.title.trim() }),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && formData.authorName.trim() && { authorName: formData.authorName.trim() }),
      });
      toast.success('Your question has been submitted for review — thank you.');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({ title: '', content: '', categoryId: 0, tags: '', isAnonymous: true, authorName: '' });
    setErrors({});
  };

  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>

        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-[#1e3a6e]/8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title className="font-heading font-extrabold text-[#1e3a6e] text-lg">
                        Ask a question
                      </Dialog.Title>
                      <p className="text-[#1e3a6e]/40 text-xs mt-0.5">There are no wrong questions here.</p>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      className="p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all disabled:opacity-30"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">

                    {/* Category */}
                    <div>
                      <label className={labelClass}>
                        Category <span className="text-[#e9924b]">*</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={e => set('categoryId', parseInt(e.target.value))}
                        className={fieldClass(!!errors.categoryId)}
                        required
                      >
                        <option value={0}>Select a category...</option>
                        {questionCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                        ))}
                      </select>
                      {errors.categoryId && <p className="text-red-500 text-xs mt-1.5">{errors.categoryId}</p>}
                    </div>

                    {/* Title */}
                    <div>
                      <label className={labelClass}>
                        Title <span className="text-[#1e3a6e]/30 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Brief summary of your question"
                        className={fieldClass()}
                        maxLength={200}
                      />
                      <p className="text-[#1e3a6e]/25 text-xs mt-1 text-right">{formData.title.length}/200</p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className={labelClass}>
                        Your question <span className="text-[#e9924b]">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={e => set('content', e.target.value)}
                        placeholder="Describe your situation. What have you tried? What specific help are you looking for?"
                        className={`${fieldClass(!!errors.content)} min-h-[130px] resize-none leading-[1.8]`}
                        required
                      />
                      {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
                      <p className="text-[#1e3a6e]/25 text-xs mt-1 text-right">{formData.content.length} characters (min. 20)</p>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className={labelClass}>
                        Tags <span className="text-[#1e3a6e]/30 font-normal">(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={e => set('tags', e.target.value)}
                        placeholder="sleep, toddler, night-time"
                        className={fieldClass()}
                      />
                    </div>

                    {/* Anonymity */}
                    <div className="rounded-xl border border-[#1e3a6e]/8 bg-[#fbfbfb] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1e3a6e] text-sm">Post anonymously</p>
                          <p className="text-[#1e3a6e]/40 text-xs mt-0.5">Your name will not appear on this question</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set('isAnonymous', !formData.isAnonymous)}
                          className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
                            formData.isAnonymous ? 'bg-[#e9924b]' : 'bg-[#1e3a6e]/15'
                          }`}
                          style={{ height: '22px', width: '40px' }}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.isAnonymous ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {formData.isAnonymous && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3"
                        >
                          <input
                            type="text"
                            value={formData.authorName}
                            onChange={e => set('authorName', e.target.value)}
                            placeholder="Display name (e.g., Concerned Parent)"
                            className={fieldClass(!!errors.authorName)}
                            maxLength={50}
                          />
                          {errors.authorName && <p className="text-red-500 text-xs mt-1.5">{errors.authorName}</p>}
                        </motion.div>
                      )}
                    </div>

                    {/* Guidelines */}
                    <div className="rounded-xl border border-[#659ec3]/15 bg-[#659ec3]/5 p-4">
                      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#659ec3] mb-3">Posting guidelines</p>
                      <ul className="space-y-2">
                        {[
                          'Be specific about your situation and what you need',
                          'Mention what you have already tried',
                          'Be respectful and kind to all members',
                          'All questions are reviewed before appearing',
                        ].map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#1e3a6e]/60 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-[#659ec3] flex-shrink-0 mt-1.5" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-[#1e3a6e]/8 flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 text-sm font-semibold rounded-xl hover:bg-[#1e3a6e]/5 transition-all disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit question'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateQuestionModal;