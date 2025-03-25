import apiClient from '@/api';
import { onMounted, reactive, ref, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

import MessageTable from '@/components/tables/MessageTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import MessageForm from '@/components/forms/MessageForm.vue';



export const useMessageStore = defineStore('message', () => {

  // Message.vue -----------------------------------------------------------
  const messages = ref([]);
  const currentRoute = useRoute();
  const router = useRouter();
  const pageInfo = reactive({
    // 값을 정수로 변환하고 실패하면 1을 기본값으로 사용
    currentPage: parseInt(currentRoute.query.page) || 1,
    currentTab: 'received',  // 기본적으로 받은 쪽지 목록
    totalCount: 0, // 전체 데이터 수
    pageLimit: 5, // 페이지네이션에 보이는 페이지의 수
    listLimit: 0 // 한 페이지에 표시될 리스트의 수
  });

  const fetchMessages = async (page, tab) => {
    console.log('fetchMessages');
    console.log(page);
    console.log(tab);

    try {
      const response = await apiClient.get(`/messages?page=${page - 1}&size=10&sort=no,desc&type=${tab}`);

      console.log(response);
      messages.value = response.data.content;
      pageInfo.totalCount = response.data.totalElements;
      pageInfo.currentTab = tab;
      pageInfo.listLimit = 10;
    } catch (error) {
      if (error.response.data.code === 404) {
        alert(error.response.data.message);

        router.push({name: 'messages'});
      } else {
        alert('쪽지 목록을 불러오는 중에 오류가 발생했습니다.');
      }
    }
  }

  const changePage = ({page, totalPages}) => {
    if (page >= 1 && page <= totalPages) {
      router.push({name: 'messages', query: {page}});
    }
  };

  const itemClick = (no) => {
    console.log(no);
    router.push({name: 'messages/no', params: {no}});
  };

  // 쪽지 삭제
  const deleteMessage = async (no) => {
    try {
      const response = await apiClient.delete(`/messages/${no}`);

      if (response.status === 200) {
        alert('정상적으로 삭제되었습니다.');

        fetchMessages(pageInfo.currentPage, pageInfo.currentTab);
      }
    } catch (error)  {

    }
  }

  // 라우트가 변경될 때 특정 로직을 실행하는 훅(Hook)이다.
  onBeforeRouteUpdate((to, form) => {
    pageInfo.currentPage = parseInt(to.query.page) || 1;

    fetchMessages(pageInfo.currentPage, pageInfo.currentTab);
  });

  onMounted(() => {
    fetchMessages(pageInfo.currentPage, pageInfo.currentTab);
  });

// MessageDetail.vue -----------------------------------------------------------

  const fetchMessage = async (no) => {
    try {
      const response = await apiClient.get(`/messages/${no}`);

      Object.assign(initFormData, response.data);
    } catch (error) {
      if (error.response.status === 404) {
        alert(error.response.message);

        router.push({name: 'messages'});
      } else {
        alert('에러가 발생했습니다.');
      }
    }
  };

  onMounted(() => {
    fetchMessage(currentRoute.params.no);
  });

  // AddMessage.vue----------------------------------------------
  
  const initFormData = reactive({
    receiverUsername: '',
    content: ''
  });

  const formSubmit = async (formData) => {
    try {
      const response = await apiClient.post(
        '/messages',
        formData
      );

      console.log(response);
      if (response.status === 200) {
        alert('정상적으로 등록되었습니다.');

        router.push({ name: 'messages' });
      }
    } catch (error) {
      if (error.response.status === 400) {
        alert('쪽지 정보를 모두 입력해 주세요');
      } else {
        alert('에러가 발생했습니다');
      }
    }
  }


});
